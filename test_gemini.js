async function list() {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDgHbjFI8kMzCXVvHCWxA6yn0Ks6zIb1_8');
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
list();
