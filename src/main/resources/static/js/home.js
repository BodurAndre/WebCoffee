// Открытие и закрытие модального окна корзины
function toggleCart() {
    var modal = document.getElementById("cart-modal");
    if (modal.style.display === "block") {
        modal.style.display = "none";
    } else {
        modal.style.display = "block";
    }
}

// Переменные для хранения количества товаров и общей суммы блюд в корзине
var cartCount = 0;
var totalCartPrice = 0;

// Добавление товара в корзину
$(document).on('click', '.add-to-cart', function() {
    cartCount++;
    updateCartCount(cartCount);

    var itemName = $(this).siblings("h2").text();
    var existingItem = findItemInCart(itemName);

    if (existingItem) {
        // Если товар найден, увеличиваем его количество на 1
        var currentQuantity = parseInt(existingItem.find(".item-quantity").val());
        existingItem.find(".item-quantity").val(currentQuantity + 1);

        // Обновляем общую стоимость товара в корзине
        var existingItemPrice = parseFloat(existingItem.find(".item-info").text().split("$")[1]);
        var newTotalPrice = (currentQuantity + 1) * existingItemPrice;
        existingItem.find(".total-price").text("Total: $" + newTotalPrice.toFixed(2));

        // Обновляем общую стоимость корзины
        totalCartPrice += existingItemPrice;
        updateTotalCartPrice(totalCartPrice);
    } else {
        // Если товар не найден, продолжаем добавлять его в корзину
        var priceString = $(this).siblings("h3").text();
        var priceParts = priceString.split("Price:");
        itemPrice = parseFloat(priceParts[1].trim());

        var itemModifiers = $(this).siblings(".modifier-controls");

        var itemTotalPrice = itemPrice;
        var modifierQuantities = [];

        // Добавление модификаторов и вычисление общей стоимости блюда
        itemModifiers.each(function() {
            var modifierName = $(this).find("span").text();
            var modifierQuantity = $(this).find(".modifier-quantity").val();
            var modifierPrice = parseFloat($(this).find(".modifier-price").text().split(' ')[1]);

            modifierQuantities.push(modifierQuantity);
            itemTotalPrice += modifierPrice * modifierQuantity;
        });
        console.log("itemName:", itemName);
        console.log("itemPrice:", itemPrice);
        console.log("modifierQuantities:", modifierQuantities);
        console.log("itemTotalPrice:", itemTotalPrice);

        addItemToCart(itemName, itemPrice, modifierQuantities, itemTotalPrice);
    }
});


function findItemInCart(itemName) {
    var cartItems = $('#cart-items').children('.cart-item');
    var existingItem = null;

    cartItems.each(function() {
        if ($(this).find(".item-info").text() === itemName) {
            existingItem = $(this);
            return false; // Прерываем цикл each, так как товар найден
        }

        console.log("cartItems" + $(this).find(".item-info").text())
    });
    return existingItem;
}

// Добавление товара в корзину с учётом модификаторов и обновление общей суммы
function addItemToCart(name, price, modifierQuantities, totalPrice) {
    var cartItems = document.getElementById("cart-items");
    var itemElement = document.createElement("div");
    itemElement.dataset.price = price;
    itemElement.classList.add("cart-item");

    var itemInfo = document.createElement("div");
    itemInfo.textContent = name;
    itemInfo.textContent += " - $" + price.toFixed(2);

    if (modifierQuantities.length > 0) {
        itemInfo.textContent += " - Modifiers: [" + modifierQuantities.join(", ") + "]";
    }

    var itemQuantity = document.createElement("input");
    itemQuantity.type = "number";
    itemQuantity.value = "1";
    itemQuantity.min = "1";
    itemQuantity.classList.add("item-quantity");

    var itemTotalPriceElement = document.createElement("div");
    itemTotalPriceElement.textContent = "Total: $" + totalPrice.toFixed(2);

    var removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.onclick = function() {
        totalCartPrice -= totalPrice;
        updateTotalCartPrice(totalCartPrice);
        cartCount--;
        updateCartCount(cartCount);
        itemElement.remove();
    };

    itemElement.appendChild(itemInfo);
    itemElement.appendChild(itemQuantity);
    itemElement.appendChild(itemTotalPriceElement);
    itemElement.appendChild(removeButton);
    cartItems.appendChild(itemElement);

    totalCartPrice += totalPrice;
    updateTotalCartPrice(totalCartPrice);
}

// Обновление отображения количества товаров в корзине
function updateCartCount(count) {
    var cartCountElement = document.querySelector(".cart-count");
    cartCountElement.textContent = count;
}

// Обновление отображения общей суммы блюд в корзине
function updateTotalCartPrice() {
    var totalPrice = 0;
    $('.cart-item').each(function() {
        var quantity = $(this).find('.item-quantity').val();
        var price = parseFloat($(this).data('price'));
        totalPrice += quantity * price;
    });
    $('.total-price').text("$" + totalPrice.toFixed(2));
}

// Удаление товара из корзины
$(document).on('click', '.remove-item-btn', function() {
    var itemElement = $(this).parent();
    var itemTotalPrice = parseFloat(itemElement.find("div:nth-child(3)").text().split(' ')[1]);

    totalCartPrice -= itemTotalPrice;
    updateTotalCartPrice(totalCartPrice);

    itemElement.remove();
    cartCount--;
    updateCartCount(cartCount);
});

// Изменение количества товара в корзине
$(document).on('change', '.item-quantity', function() {

    var quantity = parseInt($(this).val()); // Получаем новое количество товара
    var price = parseFloat($(this).siblings(".cart-item").find(".item-info").text().split('$')[1]); // Получаем цену товара
    var totalPrice = quantity * price; // Вычисляем общую стоимость товара

    $(this).siblings("div:nth-child(2)").text("Total: $" + totalPrice.toFixed(2)); // Обновляем строку "Total" внутри элемента корзины

    totalCartPrice -= price; // Вычитаем старую цену товара из общей суммы
    totalCartPrice += totalPrice; // Добавляем новую общую стоимость товара

    // Обновляем счетчик корзины в зависимости от изменения количества товара
    if (quantity > cartCount) {
        cartCount++;
        updateCartCount(cartCount); // Если увеличили количество, увеличиваем счетчик
    } else if (quantity < cartCount) {
        cartCount--;
        updateCartCount(cartCount); // Если уменьшили количество, уменьшаем счетчик
    }


    updateTotalCartPrice(totalCartPrice); // Обновляем общую сумму корзины
});


/*********************************/

$(document).ready(function() {
    $.getJSON("/api/menu", function(data) {
        // Вывести товары
        var products = data.products;
        var productsList = $('#products');
        $.each(products, function(index, product) {
            // productsList.append('<div data-category="product">' + product.name + ' (Code: ' + product.code + ', Price: ' + product.currentPrice + ')</div>');
            var productElement = $('<div class="dish"></div>');
            productElement.attr('data-category', "product");
            productElement.append('<h2>' + product.name + '</h2>')
            productElement.append('<h3>' + 'Code: ' + product.code + ', Price: ' + product.currentPrice + '</h3>')
            productElement.append('<button class="add-to-cart">Добавить в корзину</button>\n')
            productsList.append(productElement);
        });

        // Вывести блюда
        $.getJSON("/api/menu", function(data) {
            // Выводим блюда
            var dishes = data.dishes;
            var dishesContainer = $('#dishes');
            $.each(dishes, function(index, dishWithModifiers) {
                // Создаем элемент блюда
                var dishElement = $('<div class="dish"></div>');
                dishElement.attr('data-category', "dishes");
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

        // Обработчик события клика по кнопке категории
        $('.category').on('click', function() {
            // Удаляем класс active у всех кнопок
            $('.category').removeClass('active');

            // Добавляем класс active к нажатой кнопке
            $(this).addClass('active');

            // Получаем выбранную категорию
            var category = $(this).data('category');

            // Скрываем все элементы в контейнерах #products и #dishes
            $('#products .dish, #dishes .dish').hide();

            // Отображаем только элементы выбранной категории
            $('#products .dish[data-category="' + category + '"], #dishes .dish[data-category="' + category + '"]').show();
        });
    });
});
