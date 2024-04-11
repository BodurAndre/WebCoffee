/*
$(document).ready(function() {
    $.getJSON("/api/menu", function(data) {
        // Вывести товары
        var products = data.products;
        var productsList = $('#products');
        $.each(products, function(index, product) {
            productsList.append('<li>' + product.name + ' (Code: ' + product.code + ', Price: ' + product.currentPrice + ')</li>');
        });

        // Вывести блюда
        $.getJSON("/api/menu", function(data) {
            // Выводим блюда
            var dishes = data.dishes;
            var dishesContainer = $('#dishes');
            $.each(dishes, function(index, dishWithModifiers) {
                // Создаем элемент блюда
                var dishElement = $('<div class="dish"></div>');
                dishElement.append('<h2>' + dishWithModifiers.dish.name + '</h2>');
                dishElement.append('<h3>' + 'Code: ' + dishWithModifiers.dish.code + ', Price: ' + dishWithModifiers.dish.currentPrice + '</h3>');

                // Добавляем модификаторы
                if (dishWithModifiers.dishModifiers.length > 0) {
                    var modifiersList = $('<ul></ul>');
                    dishElement.append('<h3>Modifiers:</h3>');
                    dishElement.append(modifiersList);

                    $.each(dishWithModifiers.dishModifiers, function(index, dishModifier) {
                        // Получаем модификатор
                        var modifier = {};
                        $.ajax({
                            url: '/api/modifier/' + dishModifier.modifierId,
                            async: false,
                            success: function(data) {
                                modifier = data;
                            }
                        });

                        var modifierControls = $('<div class="modifier-controls"></div>');
                        modifierControls.append('<span>' + dishModifier.modifier.name + '</span>');
                        modifierControls.append('<input type="number" class="modifier-quantity" min="' + dishModifier.minQuantity + '" max="' + dishModifier.maxQuantity + '" value="' + dishModifier.quantity + '">');
                        modifiersList.append(modifierControls);
                        // Добавляем модификатор в список
                     });
                }
                dishElement.append('<button class="add-to-cart">Добавить в корзину</button>\n')
                // Добавляем элемент блюда на страницу
                dishesContainer.append(dishElement);
            });
        });
    });
});

*/
