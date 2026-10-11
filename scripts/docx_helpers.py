import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def add_callout_box(doc, title, text, bg_color="F0FDFA", border_color="0D9488"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_color)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    r_title = p.add_run(f"✦ {title}: ")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(10)
    r_title.font.color.rgb = RGBColor(13, 148, 136)
    
    r_text = p.add_run(text)
    r_text.font.name = "Arial"
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = RGBColor(30, 41, 59)
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_step_table(doc, steps):
    """
    steps is a list of tuples: (step_num, element_name, where_to_click, how_to_click, what_will_happen, system_result)
    """
    tbl = doc.add_table(rows=1, cols=5)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False

    headers = [
        ("Step & Control", Inches(1.3)),
        ("Where to Click (Location)", Inches(1.3)),
        ("How to Click (Action)", Inches(1.1)),
        ("What Will Happen (UI Effect)", Inches(1.4)),
        ("System Result (Backend / CV Engine)", Inches(1.4))
    ]

    hdr_cells = tbl.rows[0].cells
    for i, (hdr_text, col_w) in enumerate(headers):
        hdr_cells[i].width = col_w
        set_cell_background(hdr_cells[i], "0F172A")
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=100, right=100)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(hdr_text)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for idx, (element_name, where, how, ui_effect, sys_result) in enumerate(steps, 1):
        row_cells = tbl.add_row().cells
        bg = "F8FAFC" if idx % 2 == 1 else "FFFFFF"
        for i, col_w in enumerate([Inches(1.3), Inches(1.3), Inches(1.1), Inches(1.4), Inches(1.4)]):
            row_cells[i].width = col_w
            set_cell_background(row_cells[i], bg)
            set_cell_margins(row_cells[i], top=80, bottom=80, left=100, right=100)

        # Col 0: Step & Control
        p0 = row_cells[0].paragraphs[0]
        r0_num = p0.add_run(f"#{idx} ")
        r0_num.bold = True
        r0_num.font.color.rgb = RGBColor(13, 148, 136)
        r0_num.font.size = Pt(8.5)
        r0_txt = p0.add_run(element_name)
        r0_txt.bold = True
        r0_txt.font.name = "Arial"
        r0_txt.font.size = Pt(8.5)

        # Col 1: Where
        p1 = row_cells[1].paragraphs[0]
        r1 = p1.add_run(where)
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = RGBColor(51, 65, 85)

        # Col 2: How
        p2 = row_cells[2].paragraphs[0]
        r2 = p2.add_run(how)
        r2.font.name = "Arial"
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = RGBColor(15, 23, 42)

        # Col 3: What Will Happen
        p3 = row_cells[3].paragraphs[0]
        r3 = p3.add_run(ui_effect)
        r3.font.name = "Arial"
        r3.font.size = Pt(8.5)
        r3.font.color.rgb = RGBColor(51, 65, 85)

        # Col 4: System Result
        p4 = row_cells[4].paragraphs[0]
        r4 = p4.add_run(sys_result)
        r4.font.name = "Arial"
        r4.font.size = Pt(8.5)
        r4.font.color.rgb = RGBColor(13, 148, 136)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

print("Helper functions defined successfully")
