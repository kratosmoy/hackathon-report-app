package com.legacy.report.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CustomerTransactionAnalysisServiceTest {

    @Test
    @DisplayName("aggregates successful transactions by customer and sorts by total amount descending")
    void aggregatesSuccessfulTransactionsByCustomer() {
        CustomerTransactionAnalysisService service = new CustomerTransactionAnalysisService();

        List<Map<String, Object>> transactions = List.of(
                Map.of("customer_id", 1L, "name", "Customer A", "type", "VIP", "credit_score", 750, "status", "SUCCESS", "amount", new BigDecimal("10000.00")),
                Map.of("customer_id", 1L, "name", "Customer A", "type", "VIP", "credit_score", 750, "status", "SUCCESS", "amount", new BigDecimal("5000.00")),
                Map.of("customer_id", 1L, "name", "Customer A", "type", "VIP", "credit_score", 750, "status", "SUCCESS", "amount", new BigDecimal("2000.00")),
                Map.of("customer_id", 2L, "name", "Customer B", "type", "NORMAL", "credit_score", 680, "status", "SUCCESS", "amount", new BigDecimal("8000.00")),
                Map.of("customer_id", 3L, "name", "Customer C", "type", "VIP", "credit_score", 720, "status", "PENDING", "amount", new BigDecimal("15000.00")),
                Map.of("customer_id", 4L, "name", "Customer D", "type", "PREMIUM", "credit_score", 800, "status", "SUCCESS", "amount", new BigDecimal("20000.00")),
                Map.of("customer_id", 5L, "name", "Customer E", "type", "NORMAL", "credit_score", 650, "status", "SUCCESS", "amount", new BigDecimal("3000.00"))
        );

        List<Map<String, Object>> result = service.analyze(transactions);

        assertEquals(4, result.size());

        assertEquals("Customer D", result.get(0).get("name"));
        assertEquals(new BigDecimal("20000.00"), result.get(0).get("total_amount"));
        assertEquals(1L, result.get(0).get("tx_count"));
        assertEquals(new BigDecimal("20000.00"), result.get(0).get("avg_transaction"));

        assertEquals("Customer A", result.get(1).get("name"));
        assertEquals(new BigDecimal("17000.00"), result.get(1).get("total_amount"));
        assertEquals(3L, result.get(1).get("tx_count"));
        assertEquals(new BigDecimal("5666.67"), result.get(1).get("avg_transaction"));

        assertEquals("Customer B", result.get(2).get("name"));
        assertEquals(new BigDecimal("8000.00"), result.get(2).get("total_amount"));

        assertEquals("Customer E", result.get(3).get("name"));
        assertEquals(new BigDecimal("3000.00"), result.get(3).get("total_amount"));
    }
}
