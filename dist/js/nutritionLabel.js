"use strict";

function openNutritionModal(itemData) {
    const modal = $('#item-modal');

    const nutrients = itemData.nutrients || [];
    const getNutrient = (index) => nutrients[index] || {};

    $('#modal-title').text(itemData.name || '');
    $('#modal-price').text(itemData.price || '');
    $('#modal-calories').text(itemData.calories ? `${itemData.calories} cal` : '');
    $('#modal-serving').text(itemData.portion || '');

    if (itemData.icons && itemData.icons.length > 0) {
        const iconsHtml = itemData.icons.map(icon =>
            `<img src="${icon.fileName}" alt="${icon.name}" class="diet-icon" />`
        ).join('');
        $('#modal-icons').html(iconsHtml).show();
    } else {
        $('#modal-icons').hide();
    }

    $('#modal-description').text(itemData.description || '').toggle(!!itemData.description);
    $('#modal-ingredients').text(itemData.ingredients || 'Not available');

    if (itemData.allergens) {
        $('#modal-allergens').text(itemData.allergens);
        $('#allergens-section').show();
    } else {
        $('#allergens-section').hide();
    }

    $('#nutrition-serving').text(itemData.portion || '');

    const calories = getNutrient(0);
    $('#nutrition-calories').text(calories.value || '0');

    const totalFat = getNutrient(1);
    $('#nutrition-fat').text(totalFat.value || '0');
    $('#nutrition-fat-dv').text(totalFat.dailyValue || '0');

    const satFat = getNutrient(2);
    $('#nutrition-sat-fat').text(satFat.value || '0');
    $('#nutrition-sat-fat-dv').text(satFat.dailyValue || '0');

    const transFat = getNutrient(3);
    $('#nutrition-trans-fat').text(transFat.value || '0');

    const cholesterol = getNutrient(6);
    $('#nutrition-cholesterol').text(cholesterol.value || '0');
    $('#nutrition-cholesterol-dv').text(cholesterol.dailyValue || '0');

    const sodium = getNutrient(8);
    $('#nutrition-sodium').text(sodium.value || '0');
    $('#nutrition-sodium-dv').text(sodium.dailyValue || '0');

    const carbs = getNutrient(4);
    $('#nutrition-carbs').text(carbs.value || '0');
    $('#nutrition-carbs-dv').text(carbs.dailyValue || '0');

    const fiber = getNutrient(5);
    $('#nutrition-fiber').text(fiber.value || '0');
    $('#nutrition-fiber-dv').text(fiber.dailyValue || '0');

    const sugars = getNutrient(7);
    $('#nutrition-sugars').text(sugars.value || '0');

    const protein = getNutrient(12);
    $('#nutrition-protein').text(protein.value || '0');

    const vitaminD = getNutrient(14);
    $('#nutrition-vitamin-d').text(vitaminD.value || '0');
    $('#nutrition-vitamin-d-dv').text(vitaminD.dailyValue || '0');

    const calcium = getNutrient(9);
    $('#nutrition-calcium').text(calcium.value || '0');
    $('#nutrition-calcium-dv').text(calcium.dailyValue || '0');

    const iron = getNutrient(10);
    $('#nutrition-iron').text(iron.value || '0');
    $('#nutrition-iron-dv').text(iron.dailyValue || '0');

    const potassium = getNutrient(11);
    $('#nutrition-potassium').text(potassium.value || '0');
    $('#nutrition-potassium-dv').text(potassium.dailyValue || '0');

    modal.removeAttr('hidden').fadeIn(300);

    if (typeof InactivityManager !== 'undefined') {
        InactivityManager.extendForNutrition();
    }
}

function closeNutritionModal() {
    $('#item-modal').fadeOut(300, function() {
        $(this).attr('hidden', true);
    });

    if (typeof InactivityManager !== 'undefined') {
        InactivityManager.reset();
    }
}

$(document).ready(function() {
    // Ensure modal starts hidden
    $('#item-modal').attr('hidden', true).hide();

    $('#modal-close').on('click', closeNutritionModal);
    $('#item-modal .modal-overlay').on('click', closeNutritionModal);

    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && !$('#item-modal').attr('hidden')) {
            closeNutritionModal();
        }
    });
});
