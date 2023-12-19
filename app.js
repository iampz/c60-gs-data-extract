const $env = { dataType: 'unknown' };

function decorateData(data) {
  if (dataType() === 'data') {
    data.map( row => {
      if (row[6].search('- ') === -1) row[6] = [];
      else row[6] = row[6].replace(/\- /g, '').split('<br>');
      return row;
    });
  }
  return data;
}

function getDataArray(html) {
  return [...html.querySelectorAll('tr')]
    .slice(3)
    .map(
      x => [...x.querySelectorAll('td')]
        .slice(0)
        .map(
          y => y
            .innerHTML
            .replace(/^\s+/g, '')
            .replace(/\<br\>\n+\s+/g, '<br>\n')
        )
    );
}

function getTableHeader() {
  
  const type = dataType();
  const tableHeader = document.createElement('thead');
  const row = document.createElement('tr');
  
  if (type === 'master') {
    row.innerHTML = `
      <th>หมวด</th>
      <th>มาตรา</th>
      <th>ส่วน</th>
      <th>บทบัญญัติ</th>
    `
  } else if (type === 'data') {
    row.innerHTML = `
      <th>หมวด</th>
      <th>มาตรา</th>
      <th>ส่วน</th>
      <th>ร่างมาตรา</th>
      <th>บทบัญญัติ</th>
      <th>หมายเหตุ</th>
      <th>ผู้อภิปราย</th>
      <th>ประชุมครั้งที่</th>
      <th>วันที่</th>
      <th>หน้า</th>
    `
  }
  
  tableHeader.appendChild(row);
  return tableHeader;
  
}

function createTable(tableData) {
  
  const table = document.createElement('table');
  const tableHeader = getTableHeader();
  const tableBody = document.createElement('tbody');

  tableData.forEach((rowData) => {
    const row = document.createElement('tr');
    rowData.forEach((cellData) => {
      const cell = document.createElement('td');
      cell.innerHTML = cellData;
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });

  table.appendChild(tableHeader);
  table.appendChild(tableBody);
  table.border = 1;
  return table;
  
}

function dataType(file) {

  if (file)  {
    if (file.name.search(/master/i) > -1) $env.dataType = 'master';
    else if (file.name.search(/data/i) > -1) $env.dataType = 'data';
    else $env.dataType = 'unknown';
  }
  
  return $env.dataType;
  
}

function readFile(file) {
  
  const output = document.getElementById('output');
  const clipboard = document.getElementById('clipboard');
  const progress = document.getElementById('upload-progress');
  const reader = new FileReader();
  
  reader.addEventListener('load', event => {
    
    const result = event.target.result;
    const div = document.createElement('div');   
    div.innerHTML = result;

    const dataArray = getDataArray(div);
    output.innerHTML = createTable(dataArray).outerHTML;
    
    const data = decorateData(dataArray);
    clipboard.value = JSON.stringify(data);
    clipboard.select();
    document.execCommand("copy");
    $env.debug = data;
    
  });

  reader.addEventListener('progress', event => {
    if (event.loaded && event.total) {
      const percent = (event.loaded / event.total) * 100;
      if (percent === 100) progress.innerText = 'JSON data was copied to clipboard.';
      else progress.innerText = `Progress: ${Math.round(percent)}`;
    }
  });
  
  reader.readAsText(file);
  
}







(function init() {
  
  const fileSelector = document.getElementById('upload');
  const dropArea = document.getElementById('main');

  fileSelector.addEventListener('change', (event) => {
    const fileList = event.target.files;
    dataType(fileList[0]);
    readFile(fileList[0]);
  });
  
  dropArea.addEventListener('dragover', (event) => {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });

  dropArea.addEventListener('drop', (event) => {
    event.stopPropagation();
    event.preventDefault();
    const fileList = event.dataTransfer.files;
    dataType(fileList[0]);
    readFile(fileList[0]);
  });


})();
