package org.example.server.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.server.models.*;
import org.example.server.repositories.DishModifierRepository;
import org.example.server.repositories.ModifierRepository;
import org.example.server.service.ProductService;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class TokenController {

    private final ProductService productService;
    private final DishModifierRepository dishModifierRepository;
    private final ModifierRepository modifierRepository;

    public TokenController(ProductService productService, DishModifierRepository dishModifierRepository, ModifierRepository modifierRepository) {
        this.productService = productService;
        this.dishModifierRepository = dishModifierRepository;
        this.modifierRepository = modifierRepository;
    }

    private static final String TOKEN_URL = "https://api-ru.iiko.services/api/1/access_token";
    private static final String ORGANIZATIONS_URL = "https://api-ru.iiko.services/api/1/organizations";
    private static final String NOMENCLATURE_URL = "https://api-ru.iiko.services/api/1/nomenclature";

    private String token;
    private String idRestaurant = "e9161527-54d4-4141-9b26-ba90b26c2c3b";

    RestTemplate restTemplate = new RestTemplate();
    ObjectMapper objectMapper = new ObjectMapper();
    HttpHeaders headers = new HttpHeaders();

    @RequestMapping(value = "/getToken",method = RequestMethod.GET)
    public String getToken() throws JsonProcessingException {
        String requestBody = "{\"apiLogin\": \"d0987401-674\"}";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                TOKEN_URL,
                HttpMethod.POST,
                request,
                String.class);

        JsonNode jsonNode = objectMapper.readTree(response.getBody());
        token = jsonNode.get("token").asText();
        return token;
    }

    @RequestMapping(value = "getOrganization", method = RequestMethod.GET)
    public String GetOrganization(Model model) throws JsonProcessingException {
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);
        String requestBody = "{}";
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    ORGANIZATIONS_URL,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);
            model.addAttribute("body", responseEntity.getBody());
        } catch (HttpClientErrorException e) {
            if (e.getRawStatusCode() == 401) {
                token = getToken();
                return "redirect:/getOrganization";
            }
        }
        return "test/tokenResult";
    }

    @RequestMapping(value = "/saveProducts", method = RequestMethod.GET)
    public String saveProducts(Model model) throws JsonProcessingException {
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + token);
        String requestBody = "{\"organizationId\": \"" + idRestaurant + "\"}";
        HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    NOMENCLATURE_URL,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            File file = new File("/home/andrei/Documents/Projekt/products.json");
            if (!file.exists()) {
                file.createNewFile();
            }
            FileWriter fileWriter = new FileWriter(file);
            fileWriter.close();

            productService.saveProductsFromJson(responseEntity.getBody());
            model.addAttribute("body", responseEntity.getBody());

        } catch (HttpClientErrorException e) {
            if (e.getRawStatusCode() == 401) {
                token = getToken();
                return "redirect:/saveProducts";
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return "test/tokenResult";
    }


    @RequestMapping(value = "/getMenu", method = RequestMethod.GET)
    public String getMenu(Model model){

        /*List<Product> products = productService.listProduct();
        List<DishWithModifiers> dishesWithModifiers = new ArrayList<>();

        List<Dish> dishes = productService.listDish();
        for (Dish dish : dishes) {
            List<DishModifier> dishModifiers = dishModifierRepository.findByDishId(dish.getId());
            DishWithModifiers dishWithModifiers = new DishWithModifiers(dish, dishModifiers);
            dishesWithModifiers.add(dishWithModifiers);
        }

        model.addAttribute("products", products);
        model.addAttribute("dishes", dishesWithModifiers);
        return "tokenResult";*/

        return "test/rest";
    }

    @GetMapping("/api/menu")
    @ResponseBody
    public Map<String, Object> getMenuApi() {
        List<Product> products = productService.listProduct();
        List<Dish> dishes = productService.listDish();
        List<DishWithModifiers> dishesWithModifiers = new ArrayList<>();

        for (Dish dish : dishes) {
            List<DishModifier> dishModifiers = dishModifierRepository.findByDishId(dish.getId());
            DishWithModifiers dishWithModifiers = new DishWithModifiers(dish, dishModifiers);
            dishesWithModifiers.add(dishWithModifiers);
        }
        Map<String, Object> result = new HashMap<>();
        result.put("products", products);
        result.put("dishes", dishesWithModifiers);

        return result;
    }

}
