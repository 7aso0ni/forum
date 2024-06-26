// Event listener for when the document is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Fetch posts and display them
  fetchPosts();
  // Fetch user stats and display them
  fetchUserStats();
  // Fetch all user stats and display them
  fetchAllUserStats();
  // Fetch leaderboard and display it
  fetchLeaderboard();
  // Create Category and display it
  createCategoryElements();
  createBurgerMenu();
  createSideMenu();
  createFilterListeners();
});
window.addEventListener("resize", handleResize);
document.addEventListener("click", handleOutsideClick);

let selectedCategories = [];
let filterLikes = false;
let filterCreated = false;
let username = "";

// Function to check the login status of the user
// Event listener for login status update
window.addEventListener("loginStatusUpdate", (event) => {
  const { isLoggedIn } = event.detail;
  if (isLoggedIn) {
    username = localStorage.getItem("username");
    document.getElementById("create-btn").style.display = "block";
    document.querySelectorAll("#user-filters").forEach((element) => {
      element.style.display = "block";
    });
    document.querySelectorAll("#user-stats").forEach((element) => {
      element.style.display = "block";
    });
  } else {
    document.getElementById("create-btn").style.display = "none";
    document.querySelectorAll("#user-filters").forEach((element) => {
      element.style.display = "none";
    });
    document.querySelectorAll("#user-stats").forEach((element) => {
      element.style.display = "none";
    });
  }
});

async function fetchCategories() {
  try {
    const response = await fetch("/categories");
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function fetchPosts() {
  try {
    let url = "/posts?";
    username = localStorage.getItem("username");
    selectedCategories.length > 0 && (url += `&category=${selectedCategories}`);
    filterLikes && (url += `&liked=${username}`);
    filterCreated && (url += `&created=${username}`);
    const res = await fetch(url, {
      method: "GET",
    });
    if (!res.ok) {
      const errorMessage = await res.text();
      throw new Error(errorMessage);
    }
    const postsStr = await res.text();
    const posts = JSON.parse(postsStr);
    displayPosts(posts);
  } catch (error) {
    console.log(error.message);
  }
}

async function createCategoryElements() {
  const categories = await fetchCategories();
  const containers = document.querySelectorAll(".category-container");

  containers.forEach((container) => {
    container.innerHTML = "";

    categories.forEach((category) => {
      const categoryElement = document.createElement("div");
      categoryElement.className = "individual-category";
      categoryElement.textContent = category;
      categoryElement.addEventListener("click", () => {
        if (selectedCategories.includes(category)) {
          selectedCategories = selectedCategories.filter(
            (cat) => cat !== category
          );
          categoryElement.classList.remove("selected");
        } else {
          selectedCategories.push(category);
          categoryElement.classList.add("selected");
        }
        fetchPosts();
      });
      container.appendChild(categoryElement);
    });
  });
}

async function createFilterListeners() {
  const optionsContainers = document.querySelectorAll(".options");

  optionsContainers.forEach((options) => {
    if (options) {
      for (const option of options.children) {
        switch (option.innerHTML) {
          case "Created Posts":
            option.addEventListener("click", () => {
              filterCreated = !filterCreated;
              option.style.backgroundColor = filterCreated ? "green" : "";
              option.style.color = filterCreated ? "white" : "";
              fetchPosts();
            });
            break;
          case "Liked Posts":
            option.addEventListener("click", () => {
              filterLikes = !filterLikes;
              option.style.backgroundColor = filterLikes ? "green" : "";
              option.style.color = filterLikes ? "white" : "";
              fetchPosts();
            });
            break;
        }
      }
    }
  });
}

// Function to fetch and display user stats
async function fetchUserStats() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (isLoggedIn) {
    try {
      const response = await fetch("/user-stats");
      if (response.ok) {
        const stats = await response.json();
        document.querySelectorAll("#user-posts").forEach((element) => {
          element.textContent = stats.posts;
        });
        document.querySelectorAll("#user-comments").forEach((element) => {
          element.textContent = stats.comments;
        });
        document.querySelectorAll("#user-likes").forEach((element) => {
          element.textContent = stats.likes;
        });
        document.querySelectorAll("#user-dislikes").forEach((element) => {
          element.textContent = stats.dislikes;
        });
      } else {
        console.error("Error fetching user stats:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  } else {
    // Clear user stats when the user is not logged in
    document.querySelectorAll("#user-posts").forEach((element) => {
      element.textContent = "";
    });
    document.querySelectorAll("#user-comments").forEach((element) => {
      element.textContent = "";
    });
    document.querySelectorAll("#user-likes").forEach((element) => {
      element.textContent = "";
    });
    document.querySelectorAll("#user-dislikes").forEach((element) => {
      element.textContent = "";
    });
  }
}

// Function to fetch and display all user stats
async function fetchAllUserStats() {
  try {
    const response = await fetch("/all-stats");
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    const stats = await response.json();

    document.querySelectorAll("#total-posts").forEach((element) => {
      element.textContent = stats.totalPosts;
    });
    document.querySelectorAll("#total-comments").forEach((element) => {
      element.textContent = stats.totalComments;
    });
    document.querySelectorAll("#total-likes").forEach((element) => {
      element.textContent = stats.totalLikes;
    });
    document.querySelectorAll("#total-dislikes").forEach((element) => {
      element.textContent = stats.totalDislikes;
    });
  } catch (error) {
    console.log(error.message);
  }
}

// Function to fetch and display the leaderboard
async function fetchLeaderboard() {
  try {
    const response = await fetch("/leaderboard");
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
    const leaderboard = await response.json();

    const leaderboardContainers =
      document.querySelectorAll("#user-leaderboard");

    leaderboardContainers.forEach((leaderboardContainer) => {
      leaderboardContainer.innerHTML = ""; // Clear existing content

      leaderboard.forEach((user) => {
        const userProfile = document.createElement("div");
        userProfile.className = "user-profile";

        const userData = document.createElement("div");
        userData.className = "user-data";

        const avatar = document.createElement("div");
        avatar.className = "avatar";
        avatar.textContent = user.username.charAt(0).toUpperCase(); // Display first letter of username as avatar
        userData.appendChild(avatar);

        const username = document.createElement("p");
        username.textContent = user.username;
        userData.appendChild(username);

        userProfile.appendChild(userData);

        const postCount = document.createElement("p");
        postCount.textContent = user.postCount;
        userProfile.appendChild(postCount);

        leaderboardContainer.appendChild(userProfile);
      });
    });
  } catch (error) {
    console.log(error.message);
  }
}

function displayPosts(posts) {
  const postsSection = document.querySelector(".posts-section");

  // Clear the existing posts
  postsSection.innerHTML = "";

  if (posts && posts.length > 0) {
    // For loop to create and append post elements
    posts.forEach((post) => {
      const postInfo = document.createElement("div");
      postInfo.className = "post-info";

      const top = document.createElement("div");
      top.className = "top";

      const right = document.createElement("div");
      right.className = "right";

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = post.author.charAt(0).toUpperCase();
      right.appendChild(avatar);

      const authorInfo = document.createElement("p");
      authorInfo.innerHTML = `${post.author} <span>• ${new Date(
        post.creationdate
      ).toLocaleDateString()}</span>`;
      right.appendChild(authorInfo);

      top.appendChild(right);

      const left = document.createElement("div");
      left.className = "left";

      const likeStats = document.createElement("div");
      likeStats.className = "post-stats";
      likeStats.id = "like";
      const likeIcon = document.createElement("i");
      likeIcon.className = "fa-solid fa-thumbs-up";
      likeStats.appendChild(likeIcon);
      const likeNumber = document.createElement("p");
      likeNumber.className = "number";
      likeNumber.textContent = post.likes;
      likeStats.appendChild(likeNumber);
      left.appendChild(likeStats);

      const dislikeStats = document.createElement("div");
      dislikeStats.className = "post-stats";
      dislikeStats.id = "dislike";
      const dislikeIcon = document.createElement("i");
      dislikeIcon.className = "fa-solid fa-thumbs-down";
      dislikeStats.appendChild(dislikeIcon);
      const dislikeNumber = document.createElement("p");
      dislikeNumber.className = "number";
      dislikeNumber.textContent = post.dislikes;
      dislikeStats.appendChild(dislikeNumber);
      left.appendChild(dislikeStats);

      const commentStats = document.createElement("div");
      commentStats.className = "post-stats";
      commentStats.id = "comment";
      const commentIcon = document.createElement("i");
      commentIcon.className = "fa-solid fa-comment";
      commentStats.appendChild(commentIcon);
      const commentNumber = document.createElement("p");
      commentNumber.className = "number";
      commentNumber.textContent = post.commentCount;
      commentStats.appendChild(commentNumber);
      left.appendChild(commentStats);

      top.appendChild(left);

      postInfo.appendChild(top);

      const title = document.createElement("h1");
      title.textContent = post.title;

      // Include the postId in the URL when navigating to the post details page
      postInfo.addEventListener("click", () => {
        window.location.href = `/post-details/${post.post_id}`;
      });
      postInfo.appendChild(title);

      // NOTE: NO NEED FOR A SNIPPET DECIDED TO REMOVE
      // const body = document.createElement("p");
      // body.textContent = post.body;
      // postInfo.appendChild(body);

      const tags = document.createElement("div");
      tags.className = "tags";
      if (post.categories && post.categories.length > 0) {
        post.categories.forEach((category) => {
          const tag = document.createElement("div");
          tag.textContent = category;
          tags.appendChild(tag);
        });
      }
      postInfo.appendChild(tags);

      postsSection.appendChild(postInfo);
    });
  } else {
    // Display a message when there are no posts
    const noPostsMessage = document.createElement("p");
    noPostsMessage.textContent = "No posts available.";
    postsSection.appendChild(noPostsMessage);
  }
}

function createBurgerMenu() {
  const header = document.querySelector(".header");

  const burgerMenu = document.createElement("div");
  burgerMenu.className = "burger-menu";
  burgerMenu.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;
  header.appendChild(burgerMenu);

  burgerMenu.addEventListener("click", toggleSideMenu);
}

function createSideMenu() {
  const sideMenu = document.createElement("div");
  sideMenu.className = "side-menu";

  const leftSection = document.querySelector(".left-section");
  const rightSection = document.querySelector(".right-section");

  if (leftSection) {
    const leftSectionClone = leftSection.cloneNode(true);
    sideMenu.appendChild(leftSectionClone);
  }

  if (rightSection) {
    const rightSectionClone = rightSection.cloneNode(true);
    sideMenu.appendChild(rightSectionClone);
  }

  document.body.appendChild(sideMenu);
}

function toggleSideMenu() {
  const sideMenu = document.querySelector(".side-menu");
  sideMenu.classList.toggle("active");
}

function handleResize() {
  const sideMenu = document.querySelector(".side-menu");
  if (window.innerWidth > 768) {
    sideMenu.classList.remove("active");
  }
}

function handleOutsideClick(event) {
  const sideMenu = document.querySelector(".side-menu");
  const burgerMenu = document.querySelector(".burger-menu");
  if (!sideMenu.contains(event.target) && !burgerMenu.contains(event.target)) {
    sideMenu.classList.remove("active");
  }
}
