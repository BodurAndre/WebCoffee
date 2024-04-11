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
    // Найти цену в строке и извлечь число
    var priceString = $(this).siblings("h3").text();
    var priceParts = priceString.split("Price:");
    var itemPrice = parseFloat(priceParts[1].trim());


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
});

// Добавление товара в корзину с учётом модификаторов и обновление общей суммы
function addItemToCart(name, price, modifierQuantities, totalPrice) {
    var cartItems = document.getElementById("cart-items");
    var itemElement = document.createElement("div");
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
function updateTotalCartPrice(totalPrice) {
    var totalPriceElement = document.querySelector(".total-price");
    totalPriceElement.textContent = "$" + totalPrice.toFixed(2);
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
    var quantity = $(this).val();
    var price = parseFloat($(this).siblings("div:nth-child(1)").text().split(' ')[2]);
    var totalPrice = quantity * price;

    $(this).siblings("div:nth-child(2)").text("Total: $" + totalPrice.toFixed(2));

    totalCartPrice -= price;
    totalCartPrice += totalPrice;
    updateTotalCartPrice(totalCartPrice);
});

/*********************************/

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
