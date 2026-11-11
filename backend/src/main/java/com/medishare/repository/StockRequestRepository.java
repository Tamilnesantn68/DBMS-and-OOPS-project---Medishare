package com.medishare.repository;

import com.medishare.entity.StockRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StockRequestRepository extends JpaRepository<StockRequest, Long> {
    List<StockRequest> findByRequesterOrgId(Long requesterOrgId);
    List<StockRequest> findByRequesterUserId(Long requesterUserId);
    List<StockRequest> findByBatchId(Long batchId);
    List<StockRequest> findByStatus(StockRequest.RequestStatus status);
}

