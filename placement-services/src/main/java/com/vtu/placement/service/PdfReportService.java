package com.vtu.placement.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.vtu.placement.dto.EligibilityDtos.EligibilityResponse;
import com.vtu.placement.dto.ReportDtos.AssessmentEntry;
import com.vtu.placement.dto.ReportDtos.ReportRequest;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

/**
 * Builds the student performance report PDF with iText.
 *
 * iText object model (good viva answer):
 *   PdfWriter  -> where bytes go (here an in-memory stream, so nothing is written to disk)
 *   PdfDocument-> low-level PDF structure
 *   Document   -> high-level layout API; we add Paragraphs and Tables to it
 */
@Service
public class PdfReportService {

    private static final DeviceRgb PASS_GREEN = new DeviceRgb(0, 128, 0);
    private static final DeviceRgb FAIL_RED = new DeviceRgb(192, 0, 0);

    public byte[] generateStudentReport(ReportRequest r) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfDocument pdf = new PdfDocument(new PdfWriter(out));
        Document doc = new Document(pdf);

        doc.add(new Paragraph("Placement Mentoring & Skill Assessment Report")
                .setBold().setFontSize(18).setTextAlignment(TextAlignment.CENTER));
        doc.add(new Paragraph("Generated on " + LocalDate.now())
                .setFontSize(9).setTextAlignment(TextAlignment.CENTER));

        // ---- Student details
        doc.add(heading("Student Details"));
        doc.add(new Paragraph("Name: " + r.studentName()));
        doc.add(new Paragraph("Student ID: " + r.studentId()));
        if (r.email() != null) doc.add(new Paragraph("Email: " + r.email()));

        // ---- Summary metrics
        doc.add(heading("Performance Summary"));
        Table summary = table(50, 50);
        summary.addHeaderCell(header("Metric"));
        summary.addHeaderCell(header("Value"));
        addRow(summary, "Aptitude score", r.aptitudeScore() == null ? "N/A" : r.aptitudeScore() + "%");
        addRow(summary, "Coding score", r.codingScore() == null ? "N/A" : r.codingScore() + "%");
        addRow(summary, "Problems solved", r.problemsSolved() == null ? "N/A" : String.valueOf(r.problemsSolved()));
        doc.add(summary);

        // ---- Assessment history
        doc.add(heading("Assessment History"));
        List<AssessmentEntry> assessments = r.assessments() == null ? List.of() : r.assessments();
        if (assessments.isEmpty()) {
            doc.add(new Paragraph("No assessments attempted yet."));
        } else {
            Table t = table(40, 20, 20, 20);
            for (String h : new String[]{"Title", "Type", "Score", "Date"}) t.addHeaderCell(header(h));
            for (AssessmentEntry a : assessments) {
                String score = a.score() == null ? "-" : a.score() + (a.maxScore() == null ? "" : " / " + a.maxScore());
                addRow(t, a.title(), a.type(), score, a.date());
            }
            doc.add(t);
        }

        // ---- Eligibility per company
        doc.add(heading("Drive Eligibility"));
        List<EligibilityResponse> elig = r.eligibilities() == null ? List.of() : r.eligibilities();
        if (elig.isEmpty()) {
            doc.add(new Paragraph("No eligibility checks available."));
        } else {
            Table t = table(40, 30, 30);
            for (String h : new String[]{"Company", "Eligible", "Readiness"}) t.addHeaderCell(header(h));
            for (EligibilityResponse e : elig) {
                t.addCell(new Cell().add(new Paragraph(e.companyName())));
                t.addCell(new Cell().add(new Paragraph(e.eligible() ? "YES" : "NO")
                        .setFontColor(e.eligible() ? PASS_GREEN : FAIL_RED).setBold()));
                t.addCell(new Cell().add(new Paragraph(e.readinessPercent() + "%")));
            }
            doc.add(t);
        }

        doc.close();                    // flushes and closes the PdfDocument too
        return out.toByteArray();
    }

    // ------------------------------------------------------------------ layout helpers

    private Paragraph heading(String text) {
        return new Paragraph(text).setBold().setFontSize(13).setMarginTop(14);
    }

    private Table table(float... widthPercents) {
        return new Table(UnitValue.createPercentArray(widthPercents)).useAllAvailableWidth();
    }

    private Cell header(String text) {
        return new Cell().add(new Paragraph(text).setBold()).setBackgroundColor(ColorConstants.LIGHT_GRAY);
    }

    private void addRow(Table t, String... values) {
        for (String v : values) t.addCell(new Cell().add(new Paragraph(v == null ? "-" : v)));
    }
}
