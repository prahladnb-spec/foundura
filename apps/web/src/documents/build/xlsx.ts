import ExcelJS from "exceljs";
import { CHECKED_ON, type FounderDoc } from "..";
import type { Template } from "../types";

const INK = "FF141B47";
const INPUT = "FFFFF3C4";
const HEAD = "FFEEF0F8";
const RUPEE = '"₹"#,##0';
const PCT = "0.0%";

const col = (n: number) => {
  let s = "";
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};
const f = (formula: string) => ({ formula });

function header(ws: ExcelJS.Worksheet, row: number, labels: string[]) {
  labels.forEach((t, i) => {
    const c = ws.getCell(row, i + 1);
    c.value = t;
    c.font = { bold: true, color: { argb: INK } };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEAD } };
    c.alignment = { wrapText: true, vertical: "middle" };
  });
}
const input = (c: ExcelJS.Cell) => {
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: INPUT } };
};
function title(ws: ExcelJS.Worksheet, text: string) {
  ws.getCell("A1").value = text;
  ws.getCell("A1").font = { bold: true, size: 16, color: { argb: INK } };
}
function howTo(wb: ExcelJS.Workbook, name: string, lines: string[]) {
  const ws = wb.addWorksheet("How to use");
  ws.getColumn(1).width = 110;
  title(ws, name);
  [...lines, "", `Template from Foundura (foundura.org), checked ${CHECKED_ON}. A starting point: adapt it to your business.`].forEach((t, i) => {
    const c = ws.getCell(i + 3, 1);
    c.value = t;
    c.alignment = { wrapText: true };
  });
}

function capTable(wb: ExcelJS.Workbook) {
  howTo(wb, "Cap table", [
    "1. On the 'Cap table' tab, replace the sample holders with yours. Fill in the yellow cells only; totals and percentages are formulas.",
    "2. Use one row per holder. Keep options granted and the pool not yet granted on separate rows.",
    "3. Put convertible notes or other instruments that have not converted in the Notes column until their conversion price is known.",
    "4. On the 'New round' tab, enter a pre-money valuation, the amount you plan to raise and any new options to add before the round. It shows the share price and everyone's percentage afterwards.",
    "5. The share numbers must match your register of members and the allotment returns (PAS-3) filed with the MCA.",
  ]);

  const FIRST = 4;
  const LAST = 13;
  const TOTAL = LAST + 1;
  const ws = wb.addWorksheet("Cap table");
  title(ws, "[Company name]: cap table as on [date]");
  header(ws, 3, ["Holder", "Type", "Equity shares", "Preference shares (CCPS)", "Options", "Fully diluted shares", "% fully diluted", "Notes"]);
  [26, 14, 15, 18, 12, 18, 14, 44].forEach((w, i) => (ws.getColumn(i + 1).width = w));
  const sample: [string, string, number, number, number, string][] = [
    ["[Founder 1]", "Founder", 5000, 0, 0, "Vesting: 4 years, 1-year cliff from [date]"],
    ["[Founder 2]", "Founder", 5000, 0, 0, ""],
    ["[Angel investor]", "Investor", 0, 0, 0, ""],
    ["Options granted to employees", "ESOP", 0, 0, 0, "See the ESOP register"],
    ["Option pool not yet granted", "ESOP", 0, 0, 1111, "10% of fully diluted capital"],
  ];
  for (let r = FIRST; r <= LAST; r++) {
    const s = sample[r - FIRST];
    const vals = s ?? ["", "", 0, 0, 0, ""];
    ws.getCell(r, 1).value = vals[0];
    ws.getCell(r, 2).value = vals[1];
    [3, 4, 5].forEach((c) => {
      ws.getCell(r, c).value = vals[c - 1] as number;
      ws.getCell(r, c).numFmt = "#,##0";
    });
    [1, 2, 3, 4, 5, 8].forEach((c) => input(ws.getCell(r, c)));
    ws.getCell(r, 6).value = f(`C${r}+D${r}+E${r}`);
    ws.getCell(r, 6).numFmt = "#,##0";
    ws.getCell(r, 7).value = f(`IF($F$${TOTAL}=0,0,F${r}/$F$${TOTAL})`);
    ws.getCell(r, 7).numFmt = PCT;
    ws.getCell(r, 8).value = vals[5];
  }
  ws.getCell(TOTAL, 1).value = "Total";
  ["C", "D", "E", "F", "G"].forEach((c) => {
    ws.getCell(`${c}${TOTAL}`).value = f(`SUM(${c}${FIRST}:${c}${LAST})`);
    ws.getCell(`${c}${TOTAL}`).numFmt = c === "G" ? PCT : "#,##0";
  });
  ws.getRow(TOTAL).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 3 }];

  const nr = wb.addWorksheet("New round");
  title(nr, "New round: what it does to ownership");
  nr.getColumn(1).width = 44;
  [18, 14, 18, 14].forEach((w, i) => (nr.getColumn(i + 2).width = w));
  const rows: [string, ExcelJS.CellValue, string, boolean][] = [
    ["Pre-money valuation (₹)", 50000000, RUPEE, true],
    ["Amount raised (₹)", 10000000, RUPEE, true],
    ["New options added to the pool before the round", 0, "#,##0", true],
    ["", null, "", false],
    ["Fully diluted shares before the round", f(`'Cap table'!F${TOTAL}+B5`), "#,##0", false],
    ["Price per share (₹)", f("IF(B7=0,0,B3/B7)"), '"₹"#,##0.00', false],
    ["New shares issued to investors", f("IF(B8=0,0,ROUND(B4/B8,0))"), "#,##0", false],
    ["Post-money valuation (₹)", f("B3+B4"), RUPEE, false],
    ["Total shares after the round", f("B7+B9"), "#,##0", false],
    ["New investors' share", f("IF(B11=0,0,B9/B11)"), PCT, false],
  ];
  rows.forEach(([label, value, fmt, isInput], i) => {
    const r = i + 3;
    nr.getCell(r, 1).value = label;
    if (value !== null) nr.getCell(r, 2).value = value;
    if (fmt) nr.getCell(r, 2).numFmt = fmt;
    if (isInput) input(nr.getCell(r, 2));
  });
  header(nr, 15, ["Holder", "Shares before", "% before", "Shares after", "% after"]);
  let r = 16;
  for (let src = FIRST; src <= LAST; src++, r++) {
    nr.getCell(r, 1).value = f(`IF('Cap table'!A${src}="","",'Cap table'!A${src})`);
    nr.getCell(r, 2).value = f(`'Cap table'!F${src}`);
    nr.getCell(r, 3).value = f(`IF('Cap table'!$F$${TOTAL}=0,0,B${r}/'Cap table'!$F$${TOTAL})`);
    nr.getCell(r, 4).value = f(`B${r}`);
    nr.getCell(r, 5).value = f(`IF($B$11=0,0,D${r}/$B$11)`);
  }
  const extra: [string, string][] = [["New options added to the pool", "B5"], ["New investors", "B9"]];
  for (const [label, ref] of extra) {
    nr.getCell(r, 1).value = label;
    nr.getCell(r, 2).value = 0;
    nr.getCell(r, 3).value = 0;
    nr.getCell(r, 4).value = f(ref);
    nr.getCell(r, 5).value = f(`IF($B$11=0,0,D${r}/$B$11)`);
    r++;
  }
  nr.getCell(r, 1).value = "Total";
  ["B", "C", "D", "E"].forEach((c) => (nr.getCell(`${c}${r}`).value = f(`SUM(${c}16:${c}${r - 1})`)));
  nr.getRow(r).font = { bold: true };
  for (let i = 16; i <= r; i++) {
    nr.getCell(i, 2).numFmt = "#,##0";
    nr.getCell(i, 4).numFmt = "#,##0";
    nr.getCell(i, 3).numFmt = PCT;
    nr.getCell(i, 5).numFmt = PCT;
  }
}

function financialModel(wb: ExcelJS.Workbook) {
  howTo(wb, "Financial model: 36 months", [
    "1. Change the yellow cells on the 'Assumptions' tab. Everything else is a formula.",
    "2. 'Monthly' shows customers, revenue, costs, funding and closing cash for 36 months from the month you start.",
    "3. 'Summary' adds the months into three 12-month years, shows your lowest cash balance, and works out unit economics.",
    "4. The model suits a business with recurring revenue per customer. For one-off sales, treat 'revenue per customer per month' as average monthly sales per active customer, or replace the revenue rows with your own.",
    "5. Save a copy for a cautious case (slower growth, higher churn) as well as your base case. Investors and banks ask for both.",
    "6. Years here are 12-month blocks from month 1. If you need financial years (April to March), start month 1 in April.",
  ]);

  const a = wb.addWorksheet("Assumptions");
  title(a, "Assumptions: change the yellow cells");
  a.getColumn(1).width = 46;
  a.getColumn(2).width = 18;
  a.getColumn(3).width = 70;
  const rows: [string, number, string, string][] = [
    ["Cash in the bank at the start (₹)", 2000000, RUPEE, ""],
    ["Paying customers at the start", 5, "#,##0", ""],
    ["New customers in month 1", 3, "#,##0", ""],
    ["Monthly growth in new customers", 0.08, PCT, "How much more you sell each month than the last"],
    ["Monthly churn", 0.02, PCT, "Share of customers who leave each month"],
    ["Revenue per customer per month (₹)", 15000, RUPEE, "Before GST"],
    ["Gross margin", 0.7, PCT, "What is left after the direct cost of delivering the product"],
    ["Cost to acquire a customer (₹)", 40000, RUPEE, "Sales and marketing spend for each new customer"],
    ["Team size at the start", 4, "#,##0", "Include founders who draw a salary"],
    ["Average monthly cost per person (₹)", 60000, RUPEE, "Salary plus employer contributions"],
    ["New hires each quarter", 1, "#,##0", ""],
    ["Other fixed costs per month (₹)", 100000, RUPEE, "Rent, software, compliance, travel"],
    ["Funding: month it arrives", 6, "0", "1 to 36. Use 0 for no funding"],
    ["Funding: amount (₹)", 10000000, RUPEE, "Equity, grant or loan received"],
    ["Yearly salary increase", 0.08, PCT, ""],
  ];
  rows.forEach(([label, value, fmt, hint], i) => {
    const r = i + 3;
    a.getCell(r, 1).value = label;
    a.getCell(r, 2).value = value;
    a.getCell(r, 2).numFmt = fmt;
    input(a.getCell(r, 2));
    a.getCell(r, 3).value = hint;
    a.getCell(r, 3).font = { italic: true, color: { argb: "FF5B6478" } };
  });
  const A = (row: number) => `Assumptions!$B$${row}`;
  const [CASH, CUST0, NEW1, GROW, CHURN, ARPU, GM, CAC, TEAM0, COST, HIRES, FIXED, FMONTH, FAMT, RAISE] = Array.from({ length: 15 }, (_, i) => A(i + 3));

  const m = wb.addWorksheet("Monthly");
  m.getColumn(1).width = 34;
  const N = 36;
  const labels = ["Month", "New customers", "Customers who left", "Customers at month end", "Revenue (₹)", "Cost of delivery (₹)", "Gross profit (₹)", "Sales and marketing (₹)", "Team size", "Salaries (₹)", "Other fixed costs (₹)", "Total operating costs (₹)", "Net cash flow before funding (₹)", "Funding received (₹)", "Cash at month end (₹)"];
  labels.forEach((t, i) => {
    m.getCell(i + 1, 1).value = t;
    m.getCell(i + 1, 1).font = { bold: i === 0 || i === 4 || i === 14 };
  });
  for (let k = 1; k <= N; k++) {
    const c = col(k + 1);
    const prev = col(k);
    m.getColumn(k + 1).width = 14;
    const set = (row: number, v: ExcelJS.CellValue, fmt: string) => {
      m.getCell(`${c}${row}`).value = v;
      m.getCell(`${c}${row}`).numFmt = fmt;
    };
    set(1, k, "0");
    set(2, k === 1 ? f(NEW1) : f(`${prev}2*(1+${GROW})`), "#,##0");
    set(3, k === 1 ? f(`${CUST0}*${CHURN}`) : f(`${prev}4*${CHURN}`), "#,##0");
    set(4, k === 1 ? f(`${CUST0}+${c}2-${c}3`) : f(`${prev}4+${c}2-${c}3`), "#,##0");
    set(5, f(`${c}4*${ARPU}`), RUPEE);
    set(6, f(`${c}5*(1-${GM})`), RUPEE);
    set(7, f(`${c}5-${c}6`), RUPEE);
    set(8, f(`${c}2*${CAC}`), RUPEE);
    set(9, f(`${TEAM0}+${HIRES}*INT((${c}1-1)/3)`), "#,##0");
    set(10, f(`${c}9*${COST}*(1+${RAISE})^INT((${c}1-1)/12)`), RUPEE);
    set(11, f(FIXED), RUPEE);
    set(12, f(`${c}8+${c}10+${c}11`), RUPEE);
    set(13, f(`${c}7-${c}12`), RUPEE);
    set(14, f(`IF(${c}1=${FMONTH},${FAMT},0)`), RUPEE);
    set(15, k === 1 ? f(`${CASH}+${c}13+${c}14`) : f(`${prev}15+${c}13+${c}14`), RUPEE);
  }
  m.getRow(1).font = { bold: true, color: { argb: INK } };
  m.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEAD } };
  m.getRow(15).font = { bold: true };
  m.views = [{ state: "frozen", xSplit: 1, ySplit: 1 }];

  const s = wb.addWorksheet("Summary");
  title(s, "Summary");
  s.getColumn(1).width = 44;
  [2, 3, 4].forEach((c) => (s.getColumn(c).width = 20));
  header(s, 3, ["", "Year 1 (months 1 to 12)", "Year 2 (months 13 to 24)", "Year 3 (months 25 to 36)"]);
  const spans = [["B", "M"], ["N", "Y"], ["Z", "AK"]];
  const lines: [string, (from: string, to: string) => string, string][] = [
    ["Revenue (₹)", (x, y) => `SUM(Monthly!${x}5:${y}5)`, RUPEE],
    ["Gross profit (₹)", (x, y) => `SUM(Monthly!${x}7:${y}7)`, RUPEE],
    ["Operating costs (₹)", (x, y) => `SUM(Monthly!${x}12:${y}12)`, RUPEE],
    ["Net cash flow before funding (₹)", (x, y) => `SUM(Monthly!${x}13:${y}13)`, RUPEE],
    ["Funding received (₹)", (x, y) => `SUM(Monthly!${x}14:${y}14)`, RUPEE],
    ["Cash at year end (₹)", (_x, y) => `Monthly!${y}15`, RUPEE],
    ["Customers at year end", (_x, y) => `Monthly!${y}4`, "#,##0"],
    ["Team size at year end", (_x, y) => `Monthly!${y}9`, "#,##0"],
  ];
  lines.forEach(([label, make, fmt], i) => {
    s.getCell(i + 4, 1).value = label;
    spans.forEach(([x, y], j) => {
      s.getCell(i + 4, j + 2).value = f(make(x, y));
      s.getCell(i + 4, j + 2).numFmt = fmt;
    });
  });
  const extra: [string, string, string][] = [
    ["Lowest cash balance in 36 months (₹)", "MIN(Monthly!B15:AK15)", RUPEE],
    ["Month the cash runs out", 'IF(MIN(Monthly!B15:AK15)>=0,"Not within 36 months",MATCH(TRUE,INDEX(Monthly!B15:AK15<0,0),0))', "0"],
    ["Average months a customer stays", `IF(${CHURN}=0,0,1/${CHURN})`, "0.0"],
    ["Lifetime value of a customer, LTV (₹)", `IF(${CHURN}=0,0,${ARPU}*${GM}/${CHURN})`, RUPEE],
    ["LTV to acquisition cost (aim for 3 or more)", `IF(${CAC}=0,0,B17/${CAC})`, "0.0"],
    ["Months to earn back the acquisition cost", `IF(${ARPU}*${GM}=0,0,${CAC}/(${ARPU}*${GM}))`, "0.0"],
  ];
  extra.forEach(([label, formula, fmt], i) => {
    s.getCell(i + 14, 1).value = label;
    s.getCell(i + 14, 2).value = f(formula);
    s.getCell(i + 14, 2).numFmt = fmt;
  });
}

/** Builds the Excel file for a spreadsheet template. Formulas are calculated when the file is opened. */
function grids(wb: ExcelJS.Workbook, d: FounderDoc, t: Extract<Template, { kind: "sheet" }>) {
  howTo(wb, d.title, [
    "Fill in or replace the yellow cells. Cells without colour are formulas.",
    ...t.sheets.map((s) => `'${s.name}' tab: ${s.what}`),
    "Add rows by copying the last filled row down, so the formulas come with it.",
  ]);
  const FMT = { inr: RUPEE, pct: PCT, int: "#,##0" } as const;
  for (const sh of t.sheets) {
    if (!sh.grid) continue;
    const ws = wb.addWorksheet(sh.name);
    header(ws, 1, sh.grid.columns.map((c) => c.head));
    sh.grid.columns.forEach((c, i) => (ws.getColumn(i + 1).width = c.width ?? 18));
    sh.grid.rows.forEach((row, r) => {
      row.forEach((v, c) => {
        const cell = ws.getCell(r + 2, c + 1);
        const fmt = sh.grid!.columns[c]?.fmt;
        if (typeof v === "object") cell.value = f(v.f);
        else {
          cell.value = v;
          input(cell);
        }
        if (fmt && typeof v !== "string") cell.numFmt = FMT[fmt];
        cell.alignment = { wrapText: true, vertical: "top" };
      });
    });
    ws.views = [{ state: "frozen", ySplit: 1 }];
  }
}

export async function buildXlsx(d: FounderDoc): Promise<Buffer> {
  if (d.template.kind !== "sheet") throw new Error(`${d.slug} is not a spreadsheet template`);
  const wb = new ExcelJS.Workbook();
  wb.creator = "Foundura";
  wb.calcProperties.fullCalcOnLoad = true;
  if (d.template.builder === "capTable") capTable(wb);
  else if (d.template.builder === "financialModel") financialModel(wb);
  else grids(wb, d, d.template);
  return Buffer.from(await wb.xlsx.writeBuffer());
}
