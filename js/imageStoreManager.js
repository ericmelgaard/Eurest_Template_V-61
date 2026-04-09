"use strict";

(function (window) {
    var ImageStoreManager = {
        // Template developers can edit this function to map imageStore data into the DOM.
        imageInjector: function () {
            this.applyImageByName("calendar", "#card-happening", "#happening_page .cms-image img");
            this.applyImageByName("connect", "#card-connectwithus", "#connectwithus_page .cms-image img");
            this.applyImageByName("vote", "#card-vote", "#vote_page .cms-image img");
            this.applyImageByName("ambassador", "#card-ambassador", "#ambassador_page .cms-image img");
            this.applyImageByName("upcycled", "#card-foodwithpurpose", "#foodwithpurpose_page .cms-image img");
        },

        init: function () {
            if (!self.frameElement) {
                return;
            }

            if (this.isInitialized) {
                return;
            }

            var parentEle = $(self.frameElement).parent();
            var parentContainer = parentEle && parentEle[0] ? parentEle[0].parentElement : null;

            this.isInitialized = true;
            this.parentEle = parentEle;
            this.parentContainer = parentContainer;
            this.QUIET_WINDOW_MS = 240;
            this.rebuildTimer = null;
            this.rebuildInProgress = false;
            this.hasPendingChanges = false;
            this.lastMutationAt = 0;

            if (!parentContainer) {
                this.rebuildImageStore();
                this.runImageInjector();
                return;
            }

            this.rebuildImageStore();
            this.runImageInjector();
            this.observe();
        },

        runImageInjector: function () {
            if (typeof this.imageInjector === "function") {
                this.imageInjector();
            }
        },

        applyImageByName: function (nameFragment, cardSelector, imageSelector) {
            var matchedImages = imageStore.filter(function (item) {
                return item.fileName.toLowerCase().indexOf(nameFragment.toLowerCase()) >= 0 && item.fileType === "image";
            });

            if (matchedImages.length > 0) {
                $(cardSelector).show();
                $(imageSelector).attr("src", matchedImages[0].fullPath);
                console.log("Set", imageSelector, "to:", matchedImages[0].fullPath);
                return;
            }

            $(cardSelector).hide();
        },

        observe: function () {
            var _this = this;
            var observerConfig = {
                childList: true,
                subtree: false
            };

            this.imageStoreObserver = new MutationObserver(function (mutationsList) {
                var hasStructuralChange = mutationsList.some(function (mutation) {
                    return mutation.type === "childList" && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0);
                });

                if (!hasStructuralChange) {
                    return;
                }

                _this.lastMutationAt = Date.now();
                _this.hasPendingChanges = true;
                _this.scheduleStableRebuild();
            });

            this.imageStoreObserver.observe(this.parentContainer, observerConfig);
        },

        platformPath: function (url) {
            var path = "";
            for (var i = 0; i < url.length - 2; i++) {
                path = path + url[i] + "/";
            }
            console.log(path);
            return path;
        },

        normalizeImageURL: function (imageURL) {
            if (!imageURL) {
                return "";
            }
            if (!isUsingIndexedDB) {
                imageURL = imageURL.replace("..", "/CMSClient");
            }
            if (imageURL.indexOf("/content") > -1) {
                imageURL = imageURL.replace("./", "/media/developer/apps/usr/palm/applications/com.lg.app.signage/");
            }
            return imageURL;
        },

        getAssetIdFromURL: function (imageURL) {
            if (!imageURL) {
                return "";
            }
            var imageParts = imageURL.split("/").filter(Boolean);
            return imageParts.length >= 2 ? imageParts[imageParts.length - 2] : "";
        },

        getAssetZoneId: function () {
            if (typeof AssetConfiguration !== "undefined" && AssetConfiguration && AssetConfiguration.AZid) {
                return AssetConfiguration.AZid;
            }
            return null;
        },

        collectSiblingImages: function () {
            var _this = this;
            var siblingImages = [];
            var siblingEles = $(this.parentEle).siblings().get();

            siblingEles.forEach(function (each) {
                if ($(each).children().length !== 1) {
                    return;
                }

                var childSrc = $(each).children(false).attr("src");
                var imageURL = _this.normalizeImageURL(childSrc);
                if (!imageURL) {
                    return;
                }

                siblingImages.push({
                    imageURL: imageURL,
                    imageLayer: $(each).css("z-index"),
                    duration: $(each).attr("trm-duration")
                });
            });

            return siblingImages;
        },

        rebuildImageStore: function () {
            var _this = this;
            var images = this.collectSiblingImages();
            if (!Array.isArray(imageStore)) {
                imageStore = [];
            }
            imageStore.length = 0;

            images.forEach(function (each) {
                var imageParts = each.imageURL.split("/");
                var lastSegment = imageParts[imageParts.length - 1] || "";
                var extensionParts = lastSegment.split(".");
                var fileExtension = extensionParts.length > 1 ? extensionParts[extensionParts.length - 1] : "";
                var videoExtensions = ["mp4", "webm", "ogg", "avi", "mov", "wmv", "flv", "m4v"];
                var imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "tiff"];

                var fileType = "unknown";
                if (videoExtensions.includes(fileExtension.toLowerCase())) {
                    fileType = "video";
                } else if (imageExtensions.includes(fileExtension.toLowerCase())) {
                    fileType = "image";
                }

                var assetId = _this.getAssetIdFromURL(each.imageURL);
                var imgObj = {
                    fullPath: each.imageURL,
                    assetId: assetId,
                    imagePath: assetId && lastSegment ? assetId + "/" + lastSegment : lastSegment,
                    platformPath: _this.platformPath(imageParts),
                    fileName: lastSegment.split(".")[0],
                    fileExtension: fileExtension,
                    fileType: fileType,
                    imageLayer: each.imageLayer,
                    duration: each.duration
                };

                imageStore.push(imgObj);
            });

            console.log(imageStore);
            return imageStore;
        },

        dispatchImageStoreUpdated: function () {
            window.dispatchEvent(new CustomEvent("wand:imageStoreUpdated", {
                detail: {
                    assetZoneId: this.getAssetZoneId(),
                    imageStoreCount: imageStore.length,
                    updatedAt: Date.now()
                }
            }));
        },

        scheduleStableRebuild: function () {
            var _this = this;
            clearTimeout(this.rebuildTimer);
            this.rebuildTimer = setTimeout(function () {
                _this.performStableRebuild();
            }, this.QUIET_WINDOW_MS);
        },

        performStableRebuild: function () {
            var _this = this;
            if (this.rebuildInProgress) {
                this.hasPendingChanges = true;
                return;
            }
            this.rebuildInProgress = true;

            var defer = window.requestAnimationFrame || function (cb) {
                setTimeout(cb, 0);
            };

            defer(function () {
                _this.rebuildImageStore();
                _this.rebuildInProgress = false;

                var quietFor = Date.now() - _this.lastMutationAt;
                if (_this.hasPendingChanges || quietFor < _this.QUIET_WINDOW_MS) {
                    _this.hasPendingChanges = false;
                    _this.scheduleStableRebuild();
                    return;
                }

                _this.runImageInjector();
                _this.dispatchImageStoreUpdated();
            });
        }
    };

    window.ImageStoreManager = ImageStoreManager;
})(window);
