var select = document.getElementById("subjectname");

var options = ["1", "2", "3", "4", "5"]; 

options.forEach(item => {
    var opt = item;
    var el = document.createElement("option");
    el.text = opt;
    el.value = opt;
    select.add(el);
})

alert("Script has run");