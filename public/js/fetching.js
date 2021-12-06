"use strict";

// 'csrf' token needs to be passed to AJAX header
const token = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

function testPOST(path) {
  const data = [
    document.getElementById("post-title").value,
    document.getElementById("post-desc").value.trimStart(),
    document.getElementById("post-price").value,
  ];

  fetch(`/admin/${path}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json", "CSRF-Token": token },
  }).then((res) => {
    console.log("Request complete! response:", res);
    if (res.ok) window.location.href = "/";
    else alert("Error!");
    // return res.json(); // in case of body
  });
}

function testPOST2(path) {
  const data = [
    document.getElementById("post-email").value,
    document.getElementById("post-pass").value,
  ];

  fetch(`${path}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json", "CSRF-Token": token },
  })
    .then((res) => {
      if (!res.ok) throw new Error(`${errorMsg} (${response.status})`);
      return res.json();
    })
    .then((resBody) => {
      // window.location.href = resBody;
      const { path } = resBody;
      if (path === "/login") console.warn("Invalid Data");
      window.location.href = path;
    })
    .catch((err) => console.log(err));
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
    // return res.json(); // in case of body
  });
}
