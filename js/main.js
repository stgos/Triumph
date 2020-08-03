//Settings
var localStorageName = "88c64aaf-da33-4a78-8746-8431f637a0b4-storage"
var dataDefault = [
    {name: "example1", type: "main", color: "#F4F4F4"},
    {name: "example2", type: "side", color: "#18F818"},
    {name: "example3", type: "side", color: "rgb(100,20,70)"}
]
jscolor.presets.default = {
    format: 'any', alphaChannel: false, padding: 0
}

//Variables
var dataStored = []
var activeRecordChangeable = true
var activeRecord = null

//Get non-dynamic elements
var divMain = document.getElementById("div-main")
var tableMainTBody = document.getElementById("table-main").getElementsByTagName("tbody")[0]
var divButtons = document.getElementById("div-buttons")
var headersAmount = tableMainTBody.rows.length

//Launch code
DownloadData()
ChangeButtons("main")

//Launch code end

divMain.addEventListener('click', function (e) {

    //Select clicked record
    if (e.target.classList.contains("record-cell") && e.target.parentNode.parentNode.classList.contains("table-record") && activeRecordChangeable) {
        SelectRecord(e.target.parentNode.parentNode)
    }

    //Select clicked record (redirection)
    if (e.target.tagName.toLowerCase() == "input" && e.target.parentNode.classList.contains("record-cell")) {
        e.target.parentNode.click()
    }

    //Record adding state
    if (e.target.id == "button-add") {
        activeRecordChangeable = false
        var tr = AddToTable({name: "", type: "", color: "#ffffff"})
        SelectRecord(tr)
        AllowEditing(true)
        ChangeButtons("add")
    }

    //Save added record
    if (e.target.id == "button-add-save") {
        AllowEditing(false)
        var inputs = activeRecord.getElementsByTagName("input")
        dataStored.push({name: inputs[0].value, type: inputs[1].value, color: inputs[2].value})
        ChangeButtons("main")
        UploadData(dataStored)
        activeRecordChangeable = true
    }

    //Cancel adding record
    if (e.target.id == "button-add-cancel") {
        activeRecord.parentNode.removeChild(activeRecord)
        activeRecord = null
        ChangeButtons("main")
        activeRecordChangeable = true
    }

    //Record editing state
    if (e.target.id == "button-edit" && activeRecord) {
        activeRecordChangeable = false
        ChangeButtons("edit")
        AllowEditing(true)
    }

    //Save edited record
    if (e.target.id == "button-edit-save") {
        AllowEditing(false)
        ChangeButtons("main")
        var inputs = activeRecord.getElementsByTagName("input")
        var recordIndex = activeRecord.rowIndex - headersAmount
        dataStored[recordIndex].name = inputs[0].value
        dataStored[recordIndex].type = inputs[1].value
        dataStored[recordIndex].color = inputs[2].value
        UploadData(dataStored)
        activeRecordChangeable = true
    }

    //Cancel editing record
    if (e.target.id == "button-edit-cancel") {
        AllowEditing(false)
        ChangeButtons("main")
        var inputs = activeRecord.getElementsByTagName("input")
        var recordIndex = activeRecord.rowIndex - headersAmount
        inputs[0].value = dataStored[recordIndex].name
        inputs[1].value = dataStored[recordIndex].type
        inputs[2].value = dataStored[recordIndex].color
        activeRecordChangeable = true
    }

    //Delete record
    if (e.target.id == "button-delete" && activeRecord) {
        var recordIndex = activeRecord.rowIndex - headersAmount
        activeRecord.parentNode.removeChild(activeRecord)
        activeRecord = null
        dataStored.splice(recordIndex, 1)
        UploadData(dataStored)
    }

    //Raise record
    if (e.target.id == "button-up" && activeRecord) {
        var recordIndex = activeRecord.rowIndex - headersAmount
        if (recordIndex > 0) {
            var temporalRecord = dataStored[recordIndex]
            dataStored[recordIndex] = dataStored[recordIndex - 1]
            dataStored[recordIndex - 1] = temporalRecord
            tableMainTBody.insertBefore(activeRecord, tableMainTBody.rows[activeRecord.rowIndex - 1])
            UploadData(dataStored)
        }
    }

    //Lower record
    if (e.target.id == "button-down" && activeRecord) {
        var recordIndex = activeRecord.rowIndex - headersAmount
        if (recordIndex < dataStored.length - 1) {
            var temporalRecord = dataStored[recordIndex]
            dataStored[recordIndex] = dataStored[recordIndex + 1]
            dataStored[recordIndex + 1] = temporalRecord
            tableMainTBody.insertBefore(tableMainTBody.rows[activeRecord.rowIndex + 1], activeRecord)
            UploadData(dataStored)
        }
    }
})

//Add record to the table
function AddToTable(record) {
    var tr = document.createElement("tr")
    tr.classList.add("table-record")
    tr.innerHTML = "<td><div class='record-cell'><input readonly value=" + record.name + "></div></td>" +
        "<td><div class='record-cell'><input readonly value=" + record.type + "></div></td>" +
        "<td><div class='record-cell'><input readonly value=" + record.color + "></div></td>"
    tableMainTBody.appendChild(tr)
    return tr
}

//Change selected record's inputs read-only property
function AllowEditing(allowed) {
    var inputs = activeRecord.getElementsByTagName("input")
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].readOnly = !allowed
    }
    //Special case
    if (allowed) {
        inputs[2].parentNode.innerHTML = "<input data-jscolor='' value=" + inputs[2].value + ">"
        jscolor.install()
    } else {
        inputs[2].parentNode.innerHTML = "<input readonly value=" + inputs[2].value + ">"
    }
    if (allowed) {
        inputs[0].select()
    }
}

//Change available buttons
function ChangeButtons(state) {
    switch (state) {
        case "main": {
            divButtons.innerHTML = "<div><button id='button-up'>Вверх</button>" +
                "<button id='button-down'>Вниз</button></div>" +
                "<div><button id='button-add'>Добавить</button>" +
                "<button id='button-edit'>Изменить</button>" +
                "<button id='button-delete'>Удалить</button></div>"
            break
        }
        case "add": {
            divButtons.innerHTML = "<button id='button-add-save'>Сохранить</button>" +
                "<button id='button-add-cancel'>Отменить</button>"
            break
        }
        case "edit": {
            divButtons.innerHTML = "<button id='button-edit-save'>Сохранить</button>" +
                "<button id='button-edit-cancel'>Отменить</button>"
            break
        }
    }
}

//Get data from the Local Storage
function DownloadData() {
    if (localStorage) {
        var dataLoaded = localStorage.getItem(localStorageName)
        if (dataLoaded && dataLoaded != "[]") {
            dataStored = JSON.parse(dataLoaded)
        } else {
            dataStored = dataDefault
        }
    } else {
        dataStored = dataDefault
    }
    dataStored.forEach(function (x) {
        AddToTable(x)
    })
}

//Select record
function SelectRecord(tr) {
    if (!tr.classList.contains("selected")) {
        if (activeRecord) {
            activeRecord.classList.remove("selected")
        }
        activeRecord = tr
        activeRecord.classList.add("selected")
    }
}

//Upload data to the Local Storage
function UploadData(cargo) {
    if (localStorage) {
        localStorage.setItem(localStorageName, JSON.stringify(cargo))
    }
}