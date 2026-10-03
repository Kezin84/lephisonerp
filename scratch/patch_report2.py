import re
import sys

file_path = r"c:\chuSonFireBase\reminder-main\reminder-main\src\components\reportFIREBASE.vue"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# fetchReports replace
new_fetch = """const fetchReports = async () => {
  loading.value = true
  try {
    const reportRef = dbRef(database, 'REPORT')
    const snapshot = await get(reportRef)
    if (snapshot.exists()) {
      const dataObj = snapshot.val()
      let rawReports = []
      for (const key in dataObj) {
        rawReports.push({ ...dataObj[key], id: key })
      }

      let filtered = rawReports
      if (filters.value.tag) filtered = filtered.filter(r => String(r.tag).toLowerCase().includes(filters.value.tag.toLowerCase()))
      if (filters.value.phan_loai) filtered = filtered.filter(r => String(r.phan_loai).toLowerCase() === filters.value.phan_loai.toLowerCase())
      if (filters.value.trang_thai) filtered = filtered.filter(r => String(r.trang_thai).toLowerCase() === filters.value.trang_thai.toLowerCase())

      // Sort ID descending for newest first
      filtered.sort((a,b) => String(b.id).localeCompare(String(a.id)))
      
      reports.value = filtered

      if (route.query.id && !autoOpenedId) {
        autoOpenedId = true
        const r = reports.value.find(x => String(x.id) === String(route.query.id))
        if (r) {
          const rd = parseDateFromReport(r.thoi_gian)
          if (rd) {
            filters.value.filterMode = 'day'
            const dStr = `${rd.getFullYear()}-${String(rd.getMonth() + 1).padStart(2, '0')}-${String(rd.getDate()).padStart(2, '0')}`
            filters.value.dateFrom = dStr
            filters.value.dateTo = dStr
          }
          highlightedReportId.value = r.id;
          setTimeout(() => {
            const el = document.getElementById('report-card-' + r.id)
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              setTimeout(() => {
                if (highlightedReportId.value === r.id) {
                  highlightedReportId.value = null;
                }
              }, 3000);
            }
          }, 300);
        }
      }
    } else {
      reports.value = []
    }
  } catch (error) {
    alert('Lỗi khi tải dữ liệu: ' + error.message)
  } finally {
    loading.value = false
  }
}
"""
content = re.sub(r"const fetchReports = async \(\) => \{.*?(?=\nconst submitForm = async \(\) => \{)", new_fetch, content, flags=re.DOTALL)

# submitForm replace
old_submitForm_fetch = """    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const result = await response.json()
    if (result.status === 'success') {
      if (isEditing.value) {
        const index = reports.value.findIndex(r => String(r.id) === String(payload.id))
        if (index !== -1) reports.value[index] = { ...reports.value[index], ...payload }
      } else {
        payload.id = result.id
        payload.thoi_gian = result.thoi_gian
        reports.value.unshift(payload)
      }
      isModalOpen.value = false
    } else {
      alert('Lỗi: ' + result.message)
    }"""
new_submitForm_fetch = """    if (isEditing.value) {
      await update(dbRef(database, `REPORT/${payload.id}`), payload)
      const index = reports.value.findIndex(r => String(r.id) === String(payload.id))
      if (index !== -1) reports.value[index] = { ...reports.value[index], ...payload }
    } else {
      // Auto-generate ID RPT_YYYYMMDD_HHMMSS
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      payload.id = `RPT_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
      await set(dbRef(database, `REPORT/${payload.id}`), payload)
      reports.value.unshift(payload)
    }
    isModalOpen.value = false"""
content = content.replace(old_submitForm_fetch, new_submitForm_fetch)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Applied second replaces.")
