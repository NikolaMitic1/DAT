package com.example.backend.dto.request;

import com.example.backend.enums.LoadAssignmentStatus;
import lombok.Data;

@Data
public class UpdateAssignmentStatusRequest {
    private LoadAssignmentStatus status;
}
