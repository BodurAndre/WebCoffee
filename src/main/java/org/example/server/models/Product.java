package org.example.server.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "PRODUCTS")
public class Product {
    @Id
    @Column(name = "ID")
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(name = "PRODUCTID")
    private String productId;

    @Column(name = "NAME")
    private String name;

    @Column(name = "GROUPID")
    private String groupId;

    @Column(name = "CODE")
    private String code;

    @Column(name = "CURRENTPRICE")
    private Double currentPrice;

    public Product(String productId, String name, String groupId, String code, Double currentPrice){
        this.productId = productId;
        this.name = name;
        this.groupId = groupId;
        this.code = code;
        this.currentPrice = currentPrice;
    }

}
