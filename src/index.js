// Base URL for API endpoints
const baseURL = 'http://localhost:3000/posts';

// Keeps track of the currently selected post
let currentPost = null;

// Wait until the DOM is fully loaded before starting the main logic
document.addEventListener('DOMContentLoaded', main);

// Main function that initializes the app
function main() {
  displayPosts();          // Fetch and display all blog posts
  addNewPostListener();    // Attach event listener to "New Post" form
  setupEditForm();         // Setup logic for the edit form
}

// -----------------------------
// 1. Fetch and Display All Posts
// -----------------------------
function displayPosts() {
  fetch(baseURL)
    .then(res => res.json())
    .then(posts => {
      const postList = document.getElementById('post-list');
      postList.innerHTML = ''; // Clear any existing post items

      posts.forEach(post => {
        const postItem = document.createElement('div');
        postItem.className = 'cursor-pointer p-2 border-b hover:bg-green-100';
        postItem.textContent = post.title;

        // When the user clicks a title, show full post details
        postItem.addEventListener('click', () => handlePostClick(post.id));
        postList.appendChild(postItem);
      });

      // Automatically load first post's details on page load
      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      }
    });
}

// -----------------------------
// 2. Display Details of Selected Post
// -----------------------------
function handlePostClick(postId) {
  fetch(`${baseURL}/${postId}`)
    .then(res => res.json())
    .then(post => {
      currentPost = post; // Store current post for edit use

      const detail = document.getElementById('post-detail');
      detail.innerHTML = `
        <h2 class="text-2xl font-bold">${post.title}</h2>
        <img src="${post.image}" alt="Post Image" class="w-full my-4 rounded-md shadow-md">
        <p class="text-gray-600 mb-2"><strong>Author:</strong> ${post.author}</p>
        <p class="mb-4">${post.content}</p>
        <button id="edit-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2">Edit</button>
        <button id="delete-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Delete</button>
      `;

      // Attach Edit button logic
      document.getElementById('edit-btn').addEventListener('click', () => {
        // Show the edit form and populate it with current post data
        document.getElementById('edit-post-form').classList.remove('hidden');
        document.getElementById('edit-title').value = post.title;
        document.getElementById('edit-content').value = post.content;
      });

      // Attach Delete button logic
      document.getElementById('delete-btn').addEventListener('click', () => {
        fetch(`${baseURL}/${post.id}`, { method: 'DELETE' })
          .then(() => {
            // Clear post detail and refresh post list
            document.getElementById('post-detail').innerHTML = '<p class="text-gray-500 italic">Post deleted.</p>';
            displayPosts();
          });
      });
    });
}

// -----------------------------
// 3. Handle New Post Submission
// -----------------------------
function addNewPostListener() {
  const form = document.getElementById('new-post-form');

  form.addEventListener('submit', e => {
    e.preventDefault(); // Prevent page refresh

    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const author = document.getElementById('author').value.trim();
    const image = document.getElementById('image').value.trim();

    // Validate required fields
    if (!title || !content || !author) {
      alert("Please fill in all required fields.");
      return;
    }

    // Create new post object
    const newPost = { title, content, author, image };

    // Send POST request to API
    fetch(baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    })
      .then(res => res.json())
      .then(() => {
        form.reset();       // Clear form
        displayPosts();     // Refresh list with new post
      });
  });
}

// -----------------------------
// 4. Setup Edit Form Submission
// -----------------------------
function setupEditForm() {
  const form = document.getElementById('edit-post-form');

  form.addEventListener('submit', e => {
    e.preventDefault();

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
        currentPost = updatedPost;                     // Update currentPost reference
        form.classList.add('hidden');                  // Hide edit form
        handlePostClick(updatedPost.id);               // Refresh post detail view
        displayPosts();                                // Refresh post list
      });
  });

  // Cancel button hides the form without saving
  document.getElementById('cancel-edit').addEventListener('click', () => {
    form.classList.add('hidden');
  });
}
