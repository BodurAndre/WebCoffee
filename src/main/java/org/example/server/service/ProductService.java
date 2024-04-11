package org.example.server.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.example.server.models.Dish;
import org.example.server.models.DishModifier;
import org.example.server.models.Modifier;
import org.example.server.models.Product;
import org.example.server.repositories.DishModifierRepository;
import org.example.server.repositories.DishRepository;
import org.example.server.repositories.ModifierRepository;
import org.example.server.repositories.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ModifierRepository modifierRepository;
    private final DishRepository dishRepository;
    private final DishModifierRepository dishModifierRepository;

    private final ObjectMapper objectMapper;

    public ProductService(ProductRepository productRepository, ModifierRepository modifierRepository, DishRepository dishRepository, DishModifierRepository dishModifierRepository, ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.modifierRepository = modifierRepository;
        this.dishRepository = dishRepository;
        this.dishModifierRepository = dishModifierRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void saveProductsFromJson(String json) throws JsonProcessingException {
        JsonNode rootNode = objectMapper.readTree(json);
        JsonNode productsNode = rootNode.get("products");

        productRepository.deleteAll();
        dishRepository.deleteAll();
        dishModifierRepository.deleteAll();
        modifierRepository.deleteAll();

        Map<String, Dish> dishMap = new HashMap<>();
        Map<String, Modifier> modifierMap = new HashMap<>();

        for (JsonNode productNode : productsNode) {
            if (productNode.get("type").asText().equals("Modifier")) {
                String productId = productNode.get("id").asText();
                String name = productNode.get("name").asText();
                String groupId = productNode.get("groupId").asText();
                String code = productNode.get("code").asText();
                double currentPrice = productNode.get("sizePrices").get(0).get("price").get("currentPrice").asDouble();

                Modifier modifier = new Modifier(productId, name, groupId, code, currentPrice);
                modifierMap.put(productId, modifier);
                modifierRepository.save(modifier);
            }
        }

        for (JsonNode productNode : productsNode) {
            if (productNode.get("type").asText().equals("Good")) {
                String productId = productNode.get("id").asText();
                String name = productNode.get("name").asText();
                String groupId = productNode.get("groupId").asText();
                String code = productNode.get("code").asText();
                double currentPrice = productNode.get("sizePrices").get(0).get("price").get("currentPrice").asDouble();

                productRepository.save(new Product(productId, name, groupId, code, currentPrice));
            }
            if (productNode.get("type").asText().equals("Dish")) {
                String productId = productNode.get("id").asText();
                String name = productNode.get("name").asText();
                String groupId = productNode.get("groupId").asText();
                String code = productNode.get("code").asText();
                double currentPrice = productNode.get("sizePrices").get(0).get("price").get("currentPrice").asDouble();

                Dish dish = new Dish(productId, name, groupId, code, currentPrice);
                dishMap.put(productId, dish);
                dishRepository.save(dish);

                JsonNode groupModifiersNode = productNode.get("groupModifiers");
                for (JsonNode groupModifierNode : groupModifiersNode) {
                    JsonNode childModifiersNode = groupModifierNode.get("childModifiers");
                    for (JsonNode childModifierNode : childModifiersNode) {
                        String modifierId = childModifierNode.get("id").asText();
                        int minAmount = childModifierNode.get("minAmount").asInt();
                        int maxAmount = childModifierNode.get("maxAmount").asInt();
                        int defaultAmount = childModifierNode.get("defaultAmount").asInt();

                        DishModifier dishModifier = new DishModifier();
                        dishModifier.setDish(dish);
                        dishModifier.setModifier(modifierMap.get(modifierId));
                        dishModifier.setMinQuantity(minAmount);
                        dishModifier.setMaxQuantity(maxAmount);
                        dishModifier.setQuantity(defaultAmount);

                        dishModifierRepository.save(dishModifier);
                    }
                }

                JsonNode modifiersNode = productNode.get("modifiers");
                for (JsonNode modifierNode : modifiersNode) {
                        String modifierId = modifierNode.get("id").asText();
                        int minAmount = modifierNode.get("minAmount").asInt();
                        int maxAmount = modifierNode.get("maxAmount").asInt();
                        int defaultAmount = modifierNode.get("defaultAmount").asInt();

                        DishModifier dishModifier = new DishModifier();
                        dishModifier.setDish(dish);
                        dishModifier.setModifier(modifierMap.get(modifierId));
                        dishModifier.setMinQuantity(minAmount);
                        dishModifier.setMaxQuantity(maxAmount);
                        dishModifier.setQuantity(defaultAmount);

                        dishModifierRepository.save(dishModifier);
                }
            }
        }
    }

    public List<Product> listProduct() {
       return productRepository.findAll();
    }

    public List<Dish> listDish() {
        return dishRepository.findAll();
    }

    public List<Modifier> listModifier() {
        return modifierRepository.findAll();
    }
}
