package com.legacy.report.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CustomerTransactionAnalysisService {

    public List<Map<String, Object>> analyze(List<Map<String, Object>> rows) {
        Map<Long, Aggregate> aggregates = new LinkedHashMap<>();

        for (Map<String, Object> row : rows) {
            if (!"SUCCESS".equals(row.get("status"))) {
                continue;
            }

            Long customerId = ((Number) row.get("customer_id")).longValue();
            Aggregate aggregate = aggregates.computeIfAbsent(customerId, ignored -> new Aggregate(
                    customerId,
                    (String) row.get("name"),
                    (String) row.get("type"),
                    ((Number) row.get("credit_score")).intValue()
            ));

            aggregate.addAmount(toBigDecimal(row.get("amount")));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Aggregate aggregate : aggregates.values()) {
            result.add(Map.of(
                    "customer_id", aggregate.customerId,
                    "name", aggregate.name,
                    "type", aggregate.type,
                    "credit_score", aggregate.creditScore,
                    "total_amount", aggregate.totalAmount.setScale(2, RoundingMode.HALF_UP),
                    "tx_count", aggregate.txCount,
                    "avg_transaction", aggregate.averageAmount()
            ));
        }

        result.sort(Comparator.comparing(
                entry -> (BigDecimal) entry.get("total_amount"),
                Comparator.reverseOrder()
        ));

        return result;
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value instanceof BigDecimal decimal) {
            return decimal;
        }
        return new BigDecimal(String.valueOf(value));
    }

    private static final class Aggregate {
        private final Long customerId;
        private final String name;
        private final String type;
        private final Integer creditScore;
        private BigDecimal totalAmount = BigDecimal.ZERO;
        private long txCount = 0L;

        private Aggregate(Long customerId, String name, String type, Integer creditScore) {
            this.customerId = customerId;
            this.name = name;
            this.type = type;
            this.creditScore = creditScore;
        }

        private void addAmount(BigDecimal amount) {
            totalAmount = totalAmount.add(amount);
            txCount++;
        }

        private BigDecimal averageAmount() {
            if (txCount == 0L) {
                return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            }
            return totalAmount.divide(BigDecimal.valueOf(txCount), 2, RoundingMode.HALF_UP);
        }
    }
}
