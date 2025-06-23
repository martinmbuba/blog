// Base URL for the local JSON API
const baseURL = 'http://localhost:3000/posts';

// Stores the currently selected post (used for editing/updating)
let currentPost = null;

// Stores all posts to allow filtering during search
let allPosts = [];

// Wait until the entire DOM has loaded
document.addEventListener('DOMContentLoaded', main);

// Main function to initialize the app
function main() {
  displayPosts();         // Load and display all blog posts
  addNewPostListener();   // Setup the "Add Post" form submission
  setupEditForm();        // Setup the edit form behavior
  setupSearch();          // Setup the author search functionality
}

// Fetch all posts from the server and render them
function displayPosts() {
  fetch(baseURL)
    .then(res => res.json())  // Convert response to JSON
    .then(posts => {
      allPosts = posts;       // Save the full list of posts for searching
      renderPostList(posts);  // Display all posts in the left panel

      // Automatically load details of the first post
      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      }
    });
}

// Render a list of post titles on the left sidebar
function renderPostList(posts) {
  const postList = document.getElementById('post-list');
  postList.innerHTML = ''; // Clear any existing list items

  // Loop through each post and add to the DOM
  posts.forEach(post => {
    const postItem = document.createElement('div');
    postItem.className = 'cursor-pointer p-2 border-b hover:bg-green-100';
    postItem.textContent = post.title;

    // When clicked, load the post's details
    postItem.addEventListener('click', () => handlePostClick(post.id));
    postList.appendChild(postItem);
  });
}

// Show the full details of the selected post in the right panel
function handlePostClick(postId) {
  fetch(`${baseURL}/${postId}`)
    .then(res => res.json())
    .then(post => {
      currentPost = post; // Track the currently selected post

      const detail = document.getElementById('post-detail');

      // Display post details (title, image, content, author, buttons)
      detail.innerHTML = `
        <h2 class="text-2xl font-bold">${post.title}</h2>
        <img src="${post.image}" alt="Post Image" class="w-full my-4 rounded-md shadow-md">
        <p class="text-gray-600 mb-2"><strong>Author:</strong> ${post.author}</p>
        <p class="mb-4">${post.content}</p>
        <button id="edit-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2">Edit</button>
        <button id="delete-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Delete</button>
      `;

      // Attach logic for Edit button
      document.getElementById('edit-btn').addEventListener('click', () => {
        // Show edit form and pre-fill it with current post data
        document.getElementById('edit-post-form').classList.remove('hidden');
        document.getElementById('edit-title').value = post.title;
        document.getElementById('edit-content').value = post.content;
      });

      // Attach logic for Delete button
      document.getElementById('delete-btn').addEventListener('click', () => {
        fetch(`${baseURL}/${post.id}`, { method: 'DELETE' })
          .then(() => {
            // Remove post from the UI after deletion
            document.getElementById('post-detail').innerHTML = '<p class="text-gray-500 italic">Post deleted.</p>';
            displayPosts(); // Refresh the post list
          });
      });
    });
}

// Setup logic for submitting a new blog post
function addNewPostListener() {
  const form = document.getElementById('new-post-form');

  form.addEventListener('submit', e => {
    e.preventDefault(); // Prevent form from refreshing the page

    // Collect form input values
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const author = document.getElementById('author').value.trim();
    const image = document.getElementById('image').value.trim();

    // Ensure required fields are filled
    if (!title || !content || !author) {
      alert("Please fill in all required fields.");
      return;
    }

    // Construct a new post object
    const newPost = { title, content, author, image };

    // Send POST request to API to create new post
    fetch(baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    })
      .then(res => res.json())
      .then(() => {
        form.reset();   // Clear the form
        displayPosts(); // Refresh the list to include the new post
      });
  });
}

// Setup logic for submitting the edit form (PATCH request)
function setupEditForm() {
  const form = document.getElementById('edit-post-form');

  // Handle form submission for editing
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Get updated values
    const updatedTitle = document.getElementById('edit-title').value.trim();
    const updatedContent = document.getElementById('edit-content').value.trim();

    if (!currentPost) return; // Safety check

    // Send PATCH request to update the post
    fetch(`${baseURL}/${currentPost.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: updatedTitle,
        content: updatedContent
      })
    })
      .then(res => res.json())
      .then(updatedPost => {
        currentPost = updatedPost; // Update reference
        form.classList.add('hidden'); // Hide form
        handlePostClick(updatedPost.id); // Refresh detail view
        displayPosts(); // Refresh post list
      });
  });

  // Handle Cancel button in edit form
  document.getElementById('cancel-edit').addEventListener('click', () => {
    form.classList.add('hidden'); // Hide the form without saving
  });
}

// Setup real-time search for filtering posts by author name
function setupSearch() {
  const searchInput = document.getElementById('search-input');

  // Filter posts as the user types in the search box
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();

    // Filter from allPosts by author name
    const filteredPosts = allPosts.filter(post =>
      post.author.toLowerCase().includes(query)
    );

    // Re-render the filtered list
    renderPostList(filteredPosts);
  });
}
