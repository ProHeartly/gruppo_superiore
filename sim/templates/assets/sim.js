
function time(){
    fetch("/time")
    .then(r => r.json())
        .then(data => {
            if (data.error) return console.error(data.error);
            document.getElementById("t").textContent  = `${data.y}-${data.m}-${data.d}, ${data.h}`;
        }).catch(console.error);
    demand();
    supply();
}

function demand() {
  fetch("/demand")
    // .then((r) => r.json())
    // .then((data) => {
    //   if (data.error) return console.error(data.error);
    //   for (let a = 1; a <= 7; a++) {
    //     document.getElementById(`d${a}`).textContent = data[`p${a}`].p;
    //     document.getElementById(`d${a}1`).textContent = data[`p${a}`].i;
    //   }
    // })
    // .catch(console.error);
}

function supply() {
  fetch("/supply")
    // .then((r) => r.json())
    // .then((data) => {
    //   if (data.error) return console.error(data.error);
    //   for (let a = 1; a <= 7; a++) {
    //     document.getElementById(`s${a}`).textContent = data[`p${a}`].RoR;
    //     document.getElementById(`s${a}1`).textContent = data[`p${a}`].Storage;
    //     document.getElementById(`s${a}2`).textContent = data[`p${a}`].PRoR;
    //     document.getElementById(`s${a}3`).textContent = data[`p${a}`].Solar;
    //   }
    // })
    // .catch(console.error);
}


setInterval(time, 250);
time();