package org.example.server.models;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DishWithModifiers {
    private Dish dish;
    private List<DishModifier> dishModifiers;
}
