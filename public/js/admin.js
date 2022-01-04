const CSRF_TOKEN = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

const deleteProductAlt = (btn, id, path, redirectUrl) => {
  // 'btn' gets reference of html element
  const prodElement = btn.closest(".master");

  console.log(path + id);

  // fetch(`/admin/product/${id}`, {
  fetch(path + id, {
    method: "DELETE",
    // token can be also passed like this
    headers: { "CSRF-Token": CSRF_TOKEN },
  })
    .then((res) => {
      console.log(res);
      if (!res.ok) return alert(`${res.status} - operation has failed.`);

      // just refresh the page
      if (res.status === 205 && redirectUrl)
        return (window.location.href = redirectUrl);

      // update without refresh
      prodElement.remove(); // delete item
      // return res.json(); // in case of additional data
    })
    .catch((err) => {
      // err
    });
};
