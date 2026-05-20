import re

with open('c:/chuSonProject/reminder-main/reminder-main/src/components/report.vue', 'r', encoding='utf-8') as f:
    content = f.read()

bg_pattern = re.compile(r'<a v-for="\(link, i\) in (report|task)\.link_excel_bao_gia\.split\(''\\n''\)\.filter\(Boolean\)" :key="''bg''\+i" href="#" @click\.prevent\.stop="downloadExcelFile\(link, getExcelFileName\((report|task), ''link_excel_bao_gia'', i, ''Báo giá''\)\)"\s+class="tl-attach-badge" style=".*?<\/svg>\s*{{ getExcelFileName\((report|task), ''link_excel_bao_gia'', i, ''Báo giá''\) }}\s*<\/a>', re.DOTALL)

mh_pattern = re.compile(r'<a v-for="\(link, i\) in (report|task)\.link_excel_mua_hang\.split\(''\\n''\)\.filter\(Boolean\)" :key="''mh''\+i" href="#" @click\.prevent\.stop="downloadExcelFile\(link, getExcelFileName\((report|task), ''link_excel_mua_hang'', i, ''Mua hàng''\)\)"\s+class="tl-attach-badge" style=".*?<\/svg>\s*{{ getExcelFileName\((report|task), ''link_excel_mua_hang'', i, ''Mua hàng''\) }}\s*<\/a>', re.DOTALL)

def bg_repl(match):
    obj = match.group(1)
    return f'''<a v-for="(link, i) in {obj}.link_excel_bao_gia.split('\\n').filter(Boolean)" :key="'bg'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName({obj}, 'link_excel_bao_gia', i, 'Báo giá'))" class="file-attach-badge" :title="getExcelFileName({obj}, 'link_excel_bao_gia', i, 'Báo giá')">
                          <span v-html="getFileIconSvg(getExcelFileName({obj}, 'link_excel_bao_gia', i, 'Báo giá'))" style="display:flex;align-items:center;"></span>
                          <span class="file-attach-text">{{{{ getExcelFileName({obj}, 'link_excel_bao_gia', i, 'Báo giá') }}}}</span>
                        </a>'''

def mh_repl(match):
    obj = match.group(1)
    return f'''<a v-for="(link, i) in {obj}.link_excel_mua_hang.split('\\n').filter(Boolean)" :key="'mh'+i" href="#" @click.prevent.stop="downloadExcelFile(link, getExcelFileName({obj}, 'link_excel_mua_hang', i, 'Mua hàng'))" class="file-attach-badge" :title="getExcelFileName({obj}, 'link_excel_mua_hang', i, 'Mua hàng')">
                          <span v-html="getFileIconSvg(getExcelFileName({obj}, 'link_excel_mua_hang', i, 'Mua hàng'))" style="display:flex;align-items:center;"></span>
                          <span class="file-attach-text">{{{{ getExcelFileName({obj}, 'link_excel_mua_hang', i, 'Mua hàng') }}}}</span>
                        </a>'''

content = bg_pattern.sub(bg_repl, content)
content = mh_pattern.sub(mh_repl, content)

with open('c:/chuSonProject/reminder-main/reminder-main/src/components/report.vue', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replaced successfully")
