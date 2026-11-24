package com.vtu.placement.controller;

import com.vtu.placement.dto.ReportDtos.ReportRequest;
import com.vtu.placement.service.PdfReportService;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final PdfReportService pdfReportService;

    public ReportController(PdfReportService pdfReportService) {
        this.pdfReportService = pdfReportService;
    }

    /** Returns the PDF bytes; the browser downloads it because of Content-Disposition: attachment. */
    @PostMapping(value = "/student", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> studentReport(@Valid @RequestBody ReportRequest request) {
        byte[] pdf = pdfReportService.generateStudentReport(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("report-" + request.studentId() + ".pdf").build().toString())
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
