package com.scentelier.backend.service;

import com.scentelier.backend.dto.POItemDto;
import com.scentelier.backend.dto.PurchaseOrderRequestDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@Service
public class PurchaseOrderService {

    private static final String TEMPLATE_PATH = "templates/PO_Template.xlsx";
    private static final String ITEM_TABLE_PLACEHOLDER = "{{item.name}}";
    private static final String MY_COMPANY_NAME = "Scentelier Co.";
    private static final String MY_CEO_NAME = "불사조";
    private static final String MY_COMPANY_NO = "123-45-67890";
    private static final String MY_ADDRESS = "서울시 서초구";
    private static final String MY_PHONE = "02-1234-5678";

    // 엑셀 생성 로직
    public byte[] generatePurchaseOrderExcel(PurchaseOrderRequestDto request) throws Exception {

        // 양식 로딩
        try (InputStream inputStream = new ClassPathResource(TEMPLATE_PATH).getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.getSheetAt(0);

            // 1. 플레이스홀더 데이터 준비
            Map<String, String> placeholders = buildPlaceholders(request);

            // 2. 검색/채우기
            int templateRowIndex = findTemplateRow(sheet, ITEM_TABLE_PLACEHOLDER);
            if (templateRowIndex == -1) {
                throw new RuntimeException("Template row with placeholder " + ITEM_TABLE_PLACEHOLDER + " not found.");
            }
            populateItemTable(sheet, templateRowIndex, request.getItems());
            findAndReplacePlaceholders(sheet, placeholders);

            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private Map<String, String> buildPlaceholders(PurchaseOrderRequestDto request) {
        Map<String, String> placeholders = new HashMap<>();

        placeholders.put("{{PO_NUMBER}}", request.getPoNumber());
        placeholders.put("{{SUPPLIER_COMPANY}}", request.getSupplierName());
        placeholders.put("{{ORDER_DATE}}", request.getOrderDate());
        placeholders.put("{{DUE_DATE}}", request.getDueDate());
        placeholders.put("{{PAY_DATE}}", request.getPayDate());
        placeholders.put("{{REMARKS}}", request.getRemarks());

        placeholders.put("{{MY_COMPANY}}", MY_COMPANY_NAME);
        placeholders.put("{{CEO_NAME}}", MY_CEO_NAME);
        placeholders.put("{{COMPANY_NO}}", MY_COMPANY_NO);
        placeholders.put("{{ADDRESS}}", MY_ADDRESS);
        placeholders.put("{{PHONE}}", MY_PHONE);

        BigDecimal subtotal = request.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal vat = subtotal.multiply(new BigDecimal("0.1"));
        BigDecimal total = subtotal.add(vat);

        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(Locale.KOREA);

        placeholders.put("{{SUBTOTAL}}", currencyFormat.format(subtotal.doubleValue()));
        placeholders.put("{{VAT}}", currencyFormat.format(vat.doubleValue()));
        placeholders.put("{{TOTAL}}", currencyFormat.format(total.doubleValue()));

        return placeholders;
    }

    private void findAndReplacePlaceholders(Sheet sheet, Map<String, String> placeholders) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell.getCellType() == CellType.STRING) {
                    String cellValue = cell.getStringCellValue();
                    if (placeholders.containsKey(cellValue)) {
                        cell.setCellValue(placeholders.get(cellValue));
                    }
                }
            }
        }
    }

    private int findTemplateRow(Sheet sheet, String placeholder) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell.getCellType() == CellType.STRING && placeholder.equals(cell.getStringCellValue())) {
                    return row.getRowNum();
                }
            }
        }
        return -1; // Not found
    }

    private void populateItemTable(Sheet sheet, int templateRowIndex, List<POItemDto> items) {
        Row templateRow = sheet.getRow(templateRowIndex);
        if (templateRow == null || items.isEmpty()) {
            return;
        }

        List<CellStyle> templateStyles = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Cell cell = templateRow.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            templateStyles.add(cell.getCellStyle());
        }
        int numItems = items.size();
        if (numItems > 1) { // We need (n-1) new rows
            sheet.shiftRows(templateRowIndex + 1, sheet.getLastRowNum(), numItems - 1, true, false);
        }

        for (int i = 0; i < numItems; i++) {
            POItemDto item = items.get(i);


            Row dataRow = (i == 0) ? templateRow : sheet.createRow(templateRowIndex + i);

            BigDecimal supplyPrice = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

            for (int j = 0; j < 5; j++) { // 5 columns
                Cell dataCell = dataRow.createCell(j);
                dataCell.setCellStyle(templateStyles.get(j)); // Apply style

                switch (j) {
                    case 0: // "상품 번호" (No.)
                        dataCell.setCellValue(i + 1);
                        break;
                    case 1: // "품명" (Name)
                        dataCell.setCellValue(item.getName());
                        break;
                    case 2: // "수량" (Quantity)
                        dataCell.setCellValue(item.getQuantity());
                        break;
                    case 3: // "단가" (Unit Price)
                        // Note: This relies on your cell style being formatted as a number/currency
                        dataCell.setCellValue(item.getUnitPrice().doubleValue());
                        break;
                    case 4: // "공급가액" (Supply Price)
                        dataCell.setCellValue(supplyPrice.doubleValue());
                        break;
                }
            }
        }
    }
}