"use strict";

function openNutritionModal(itemData) {
    const modal = $('#item-modal');

    console.log('Opening nutrition modal with data:', itemData);
    console.log('Nutrients array:', itemData.nutrients);

    const nutrients = itemData.nutrients || [];

    // Create a map of nutrients by name for easier access
    const nutrientMap = {};
    nutrients.forEach(nutrient => {
        if (nutrient.name) {
            nutrientMap[nutrient.name.toLowerCase()] = nutrient;
        }
    });

    const getNutrientByName = (name) => {
        const nutrient = nutrientMap[name.toLowerCase()];
        return nutrient || { value: '0', dailyValuePercentage: '0' };
    };

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

    const calories = getNutrientByName('Calories');
    console.log('Calories nutrient:', calories);
    $('#nutrition-calories').text(calories.value || '0');

    const totalFat = getNutrientByName('Fat (g)');
    console.log('Total Fat nutrient:', totalFat);
    const totalFatValue = totalFat.value && totalFat.value !== '-' ? totalFat.value : '0';
    const totalFatDV = totalFat.dailyValuePercentage ? totalFat.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-fat').text(totalFatValue);
    $('#nutrition-fat-dv').text(totalFatDV);

    const satFat = getNutrientByName('Saturated Fat (g)');
    const satFatValue = satFat.value && satFat.value !== '-' ? satFat.value : '0';
    const satFatDV = satFat.dailyValuePercentage ? satFat.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-sat-fat').text(satFatValue);
    $('#nutrition-sat-fat-dv').text(satFatDV);

    const transFat = getNutrientByName('Trans Fat (g)');
    const transFatValue = transFat.value && transFat.value !== '-' ? transFat.value : '0';
    $('#nutrition-trans-fat').text(transFatValue);

    const cholesterol = getNutrientByName('Cholesterol (mg)');
    const cholesterolValue = cholesterol.value && cholesterol.value !== '-' ? cholesterol.value : '0';
    const cholesterolDV = cholesterol.dailyValuePercentage ? cholesterol.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-cholesterol').text(cholesterolValue);
    $('#nutrition-cholesterol-dv').text(cholesterolDV);

    const sodium = getNutrientByName('Sodium (mg)');
    const sodiumValue = sodium.value && sodium.value !== '-' ? sodium.value : '0';
    const sodiumDV = sodium.dailyValuePercentage ? sodium.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-sodium').text(sodiumValue);
    $('#nutrition-sodium-dv').text(sodiumDV);

    const carbs = getNutrientByName('Carbohydrate (g)');
    const carbsValue = carbs.value && carbs.value !== '-' ? carbs.value : '0';
    const carbsDV = carbs.dailyValuePercentage ? carbs.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-carbs').text(carbsValue);
    $('#nutrition-carbs-dv').text(carbsDV);

    const fiber = getNutrientByName('Dietary Fiber (g)');
    const fiberValue = fiber.value && fiber.value !== '-' ? fiber.value : '0';
    const fiberDV = fiber.dailyValuePercentage ? fiber.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-fiber').text(fiberValue);
    $('#nutrition-fiber-dv').text(fiberDV);

    const sugars = getNutrientByName('Sugars (g)');
    const sugarsValue = sugars.value && sugars.value !== '-' ? sugars.value : '0';
    $('#nutrition-sugars').text(sugarsValue);

    const protein = getNutrientByName('Protein (g)');
    const proteinValue = protein.value && protein.value !== '-' ? protein.value : '0';
    $('#nutrition-protein').text(proteinValue);

    const vitaminD = getNutrientByName('Vitamin D (mcg)');
    const vitaminDValue = vitaminD.value && vitaminD.value !== '-' ? vitaminD.value : '0';
    const vitaminDDV = vitaminD.dailyValuePercentage ? vitaminD.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-vitamin-d').text(vitaminDValue);
    $('#nutrition-vitamin-d-dv').text(vitaminDDV);

    const calcium = getNutrientByName('Calcium (mg)');
    const calciumValue = calcium.value && calcium.value !== '-' ? calcium.value : '0';
    const calciumDV = calcium.dailyValuePercentage ? calcium.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-calcium').text(calciumValue);
    $('#nutrition-calcium-dv').text(calciumDV);

    const iron = getNutrientByName('Iron (mg)');
    const ironValue = iron.value && iron.value !== '-' ? iron.value : '0';
    const ironDV = iron.dailyValuePercentage ? iron.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-iron').text(ironValue);
    $('#nutrition-iron-dv').text(ironDV);

    const potassium = getNutrientByName('Potassium (mg)');
    const potassiumValue = potassium.value && potassium.value !== '-' ? potassium.value : '0';
    const potassiumDV = potassium.dailyValuePercentage ? potassium.dailyValuePercentage.replace('%', '') : '0';
    $('#nutrition-potassium').text(potassiumValue);
    $('#nutrition-potassium-dv').text(potassiumDV);

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
