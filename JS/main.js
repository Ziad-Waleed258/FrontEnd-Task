$(document).ready(function () {
  const API_URLS = {
    users: "https://jsonplaceholder.typicode.com/users",
    posts: "https://jsonplaceholder.typicode.com/posts",
    comments: "https://jsonplaceholder.typicode.com/comments",
  };

  let userData = [];
  let postData = [];
  let commentData = [];
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  let usersTable;

  const loader = $("#loader");
  const usersTableEl = $("#usersTable");
  const postsList = $("#postsList");
  const userModal = $("#userModal");
  const postModal = $("#postModal");
  const commentsModal = $("#commentsModal");
  const confirmationModal = $("#confirmationModal");

  let pendingDelete = {
    action: null,
    id: null,
  };

  function showLoader() {
    loader.removeClass("hidden");
  }
  function hideLoader() {
    loader.addClass("hidden");
  }

  function showToastr(type, message) {
    toastr.options = {
      rtl: false,
      positionClass: "toast-top-right",
      progressBar: true,
    };
    toastr[type](message);
  }

  function loadTheme() {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    $("body").toggleClass("dark-mode", isDarkMode);
    $("#modeToggleBtn i")
      .toggleClass("fa-sun", isDarkMode)
      .toggleClass("fa-moon", !isDarkMode);
    $("#modeToggleBtn").text(isDarkMode ? "Light Mode" : "Dark Mode");
  }

  $("#modeToggleBtn").on("click", function () {
    const isDarkMode = $("body").hasClass("dark-mode");
    localStorage.setItem("darkMode", !isDarkMode);
    loadTheme();
  });

  loadTheme();

  function fetchAllData() {
    showLoader();
    $.when(
      $.ajax({ url: API_URLS.users, method: "GET" }),
      $.ajax({ url: API_URLS.posts, method: "GET" }),
      $.ajax({ url: API_URLS.comments, method: "GET" })
    )
      .done(function (users, posts, comments) {
        userData = users[0];
        postData = posts[0];
        commentData = comments[0];

        updateDashboardStats();
        renderUsersTable();
        renderPosts();
      })
      .fail(function (err) {
        showToastr("error", "Failed to load data from API!");
        console.error(err);
      })
      .always(function () {
        hideLoader();
      });
  }

  function updateDashboardStats() {
    $("#usersCount").text(userData.length);
    $("#postsCount").text(postData.length);
    $("#commentsCount").text(commentData.length);
  }

  function getUserNameById(userId) {
    const user = userData.find((u) => u.id === userId);
    return user ? user.name : "Unknown User";
  }

  // --- Navigation Logic ---
  $(".nav-btn").on("click", function () {
    const targetSectionId = $(this).data("target");
    // Hide all content sections
    $(".content-section").removeClass("active");
    // Show the target section
    $(`#${targetSectionId}`).addClass("active");
    // Update active state of navigation buttons
    $(".nav-btn").removeClass("active");
    $(this).addClass("active");
  });

  // --- Users Table Logic (DataTables) ---
  function renderUsersTable() {
    if ($.fn.DataTable.isDataTable(usersTableEl)) {
      usersTable.destroy();
    }
    usersTable = usersTableEl.DataTable({
      data: userData,
      columns: [
        { data: "name", title: "Name" },
        { data: "username", title: "Username" },
        { data: "email", title: "Email" },
        { data: "website", title: "Website" },
        {
          data: null,
          title: "Actions",
          render: function (data, type, row) {
            const isFavorite = favorites.includes(row.id);
            return `
                                <button class="action-btn edit-btn" data-id="${
                                  row.id
                                }"><i class="fas fa-edit"></i></button>
                                <button class="action-btn delete-btn" data-id="${
                                  row.id
                                }"><i class="fas fa-trash"></i></button>
                                <button class="action-btn favorite-btn ${
                                  isFavorite ? "active" : ""
                                }" data-id="${
              row.id
            }"><i class="fas fa-star"></i></button>
                            `;
          },
        },
      ],
      language: {
        url: "//cdn.datatables.net/plug-ins/1.13.4/i18n/en-GB.json",
      },
    });
  }

  usersTableEl.on("click", ".edit-btn", function () {
    const userId = $(this).data("id");
    const user = userData.find((u) => u.id === userId);
    $("#userModalTitle").text("Edit User");
    $("#userId").val(user.id);
    $("#userName").val(user.name);
    $("#userUsername").val(user.username);
    $("#userEmail").val(user.email);
    $("#userWebsite").val(user.website);
    userModal
      .css("display", "flex")
      .addClass("animate__animated animate__zoomIn");
  });

  // REPLACED `confirm()` with custom modal
  usersTableEl.on("click", ".delete-btn", function () {
    const userId = $(this).data("id");
    $("#confirmationMessage").text(
      "Are you sure you want to delete this user?"
    );
    pendingDelete.action = "user";
    pendingDelete.id = userId;
    confirmationModal.css("display", "flex");
  });

  usersTableEl.on("click", ".favorite-btn", function () {
    const userId = $(this).data("id");
    if (favorites.includes(userId)) {
      favorites = favorites.filter((id) => id !== userId);
      showToastr("info", "User removed from favorites.");
    } else {
      favorites.push(userId);
      showToastr("success", "User added to favorites.");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    $(this).toggleClass("active");
  });

  $("#addUserBtn").on("click", function () {
    $("#userModalTitle").text("Add New User");
    $("#userForm")[0].reset();
    $("#userId").val("");
    userModal
      .css("display", "flex")
      .addClass("animate__animated animate__zoomIn");
  });

  $("#userForm").on("submit", function (e) {
    e.preventDefault();
    const userId = $("#userId").val();
    const newUser = {
      id: userId ? parseInt(userId) : userData.length + 1,
      name: $("#userName").val(),
      username: $("#userUsername").val(),
      email: $("#userEmail").val(),
      website: $("#userWebsite").val(),
    };

    if (userId) {
      const index = userData.findIndex((u) => u.id === parseInt(userId));
      if (index !== -1) {
        userData[index] = newUser;
        showToastr("success", "User updated successfully.");
      }
    } else {
      userData.push(newUser);
      showToastr("success", "User added successfully.");
    }
    renderUsersTable();
    updateDashboardStats();
    userModal.css("display", "none");
  });

  // --- Posts Page Logic ---
  function renderPosts(filteredPosts = postData) {
    postsList.empty();
    if (filteredPosts.length === 0) {
      postsList.append("<p>No matching posts found.</p>");
      return;
    }
    filteredPosts.forEach((post) => {
      const postCard = `
                    <div class="post-card animate__animated animate__fadeInUp" data-id="${
                      post.id
                    }">
                        <h4>${post.title}</h4>
                        <p>${post.body}</p>
                        <small>By: ${getUserNameById(post.userId)}</small>
                        <div style="margin-top: 10px;">
                            <button class="btn view-comments-btn" data-id="${
                              post.id
                            }"><i class="fas fa-comments"></i> View Comments</button>
                            <button class="action-btn edit-post-btn" data-id="${
                              post.id
                            }"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete-post-btn" data-id="${
                              post.id
                            }"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                `;
      postsList.append(postCard);
    });
  }

  $("#postSearch").on("keyup", function () {
    const searchTerm = $(this).val().toLowerCase();
    const filteredPosts = postData.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.body.toLowerCase().includes(searchTerm)
    );
    renderPosts(filteredPosts);
  });

  postsList.on("click", ".view-comments-btn", function () {
    const postId = $(this).data("id");
    showLoader();
    $.get(`${API_URLS.comments}?postId=${postId}`)
      .done(function (comments) {
        const commentsListEl = $("#commentsList");
        commentsListEl.empty();
        if (comments.length === 0) {
          commentsListEl.append("<p>No comments for this post.</p>");
        } else {
          comments.forEach((comment) => {
            commentsListEl.append(`
                            <div style="border-bottom: 1px solid var(--border-color); padding: 10px 0;">
                                <strong>${comment.name}</strong> (${comment.email})
                                <p>${comment.body}</p>
                            </div>
                        `);
          });
        }
        commentsModal
          .css("display", "flex")
          .addClass("animate__animated animate__zoomIn");
      })
      .fail(function () {
        showToastr("error", "Failed to load comments.");
      })
      .always(function () {
        hideLoader();
      });
  });

  postsList.on("click", ".edit-post-btn", function () {
    const postId = $(this).data("id");
    const post = postData.find((p) => p.id === postId);
    $("#postModalTitle").text("Edit Post");
    $("#postId").val(post.id);
    $("#postTitle").val(post.title);
    $("#postBody").val(post.body);
    postModal
      .css("display", "flex")
      .addClass("animate__animated animate__zoomIn");
  });

  // REPLACED `confirm()` with custom modal
  postsList.on("click", ".delete-post-btn", function () {
    const postId = $(this).data("id");
    $("#confirmationMessage").text(
      "Are you sure you want to delete this post?"
    );
    pendingDelete.action = "post";
    pendingDelete.id = postId;
    confirmationModal.css("display", "flex");
  });

  $("#addPostBtn").on("click", function () {
    $("#postModalTitle").text("Add New Post");
    $("#postForm")[0].reset();
    $("#postId").val("");
    postModal
      .css("display", "flex")
      .addClass("animate__animated animate__zoomIn");
  });

  $("#postForm").on("submit", function (e) {
    e.preventDefault();
    const postId = $("#postId").val();
    const newPost = {
      id: postId ? parseInt(postId) : postData.length + 1,
      title: $("#postTitle").val(),
      body: $("#postBody").val(),
      userId: 1, // Assume user 1 for local adds
    };
    if (postId) {
      const index = postData.findIndex((p) => p.id === parseInt(postId));
      if (index !== -1) {
        postData[index] = newPost;
        showToastr("success", "Post updated successfully.");
      }
    } else {
      postData.push(newPost);
      showToastr("success", "Post added successfully.");
    }
    renderPosts();
    updateDashboardStats();
    postModal.css("display", "none");
  });

  // --- Modals Logic ---
  $(".modal .close-btn").on("click", function () {
    $(this).closest(".modal").css("display", "none");
  });

  $(window).on("click", function (event) {
    if ($(event.target).is(".modal")) {
      $(event.target).css("display", "none");
    }
  });

  // New logic for custom confirmation modal
  $("#confirmDeleteBtn").on("click", function () {
    if (pendingDelete.action === "user") {
      const userIndex = userData.findIndex((u) => u.id === pendingDelete.id);
      userData.splice(userIndex, 1);
      renderUsersTable();
      updateDashboardStats();
      showToastr("success", "User deleted successfully.");
    } else if (pendingDelete.action === "post") {
      const postIndex = postData.findIndex((p) => p.id === pendingDelete.id);
      postData.splice(postIndex, 1);
      renderPosts();
      updateDashboardStats();
      showToastr("success", "Post deleted successfully.");
    }
    confirmationModal.css("display", "none");
  });

  $("#confirmCancelBtn").on("click", function () {
    showToastr("info", "Deletion cancelled.");
    confirmationModal.css("display", "none");
  });

  // Initial data load
  fetchAllData();
});
