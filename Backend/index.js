function fetchPosts() {
  return new Promise((res, rej) => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(resp => resp.json())  // Only call once
      .then(data => res(data))    // Resolve outer promise
      .catch(err => {
        console.error("Fetch error:", err);
        rej(err);                 // Reject on error
      });
  });
}

// Calling the function
 const data= fetchPosts()
 data.then(posts => {
   console.log("Fetched Posts:", posts);
 }).catch(err => {
   console.error("Error in fetchPosts():", err);
 });
