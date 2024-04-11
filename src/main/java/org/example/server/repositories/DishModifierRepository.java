package org.example.server.repositories;

import org.example.server.models.DishModifier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DishModifierRepository extends JpaRepository<DishModifier,Long>  {

    @Query("SELECT m FROM DishModifier m WHERE m.dish.id = :id")
    List<DishModifier> findByDishId(Long id);

}
