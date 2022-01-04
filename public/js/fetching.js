"use strict";

// 'csrf' token needs to be passed to AJAX header
const token = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

function testPOST(path) {
  const data = {
    title: document.getElementById("post-title").value,
    description: document.getElementById("post-desc").value.trimStart(),
    price: document.getElementById("post-price").value,
  };

  fetch(`/admin/${path}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json", "CSRF-Token": token },
  }).then((res) => {
    console.log("Request complete! response:", res);
    if (res.ok) window.location.href = "/";
    else {
      alert("Error!");
      // read headers
      // the headers are not an object, they’re an iterator
      for (var [i, e] of res.headers.entries()) {
        // accessing the entries
        console.warn(i, "<=>", e);
      }
    }
    // return res.json(); // in case of body
  });
}

function deletePOST(id, path, redirectUrl = "/") {
  console.log(JSON.stringify(id));

  // fetch(`/admin/del-product`, {
  fetch(`${path}`, {
    method: "POST",
    body: JSON.stringify({ prodId: id }),
    headers: { "Content-Type": "application/json", "CSRF-Token": token },
  }).then((res) => {
    console.log("Request complete! response:", res);
    if (res.ok) window.location.href = redirectUrl;
    else alert("Error!");
  });
}
