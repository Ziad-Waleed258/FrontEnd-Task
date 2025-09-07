# FrontEnd-Task
#How the Application Works
This application is a complete, single-file dashboard built with HTML, CSS, and JavaScript.

HTML: This provides the foundational structure of the page, including the navigation buttons, the dashboard statistics, the users table, the posts list, and the various pop-up modals for adding, editing, and confirming actions.

CSS: This handles the styling and layout. It's responsible for the clean, modern look and the responsive design that adapts to different screen sizes. A key feature is the light and dark mode, which the user can toggle with a button.

JavaScript: This is the core logic that makes the dashboard interactive and dynamic. Its main functions include:

Fetching Data: The application retrieves all its data—for users, posts, and comments—from the external JSONPlaceholder API using AJAX requests.

Navigation: It manages the view, showing only one content section at a time (Dashboard, Users, or Posts) based on which navigation button is active.

User Interaction: It handles all user actions, such as adding and editing users and posts via forms in modals, deleting items, and searching through posts.

State Management: It temporarily stores the fetched data, tracks user favorites using localStorage, and handles the state of the modals.

Custom Confirmation: The native confirm() and alert() pop-ups are replaced with a custom, styled modal to provide a better user experience within the application's design.

External Libraries Used
To add advanced functionality and streamline development, the code uses several external libraries, all loaded from a Content Delivery Network (CDN):

jQuery: This powerful JavaScript library simplifies tasks like DOM manipulation, event handling, and making AJAX requests, making the code cleaner and more concise.

DataTables: This library takes a simple HTML table and transforms it into a feature-rich, interactive component. It adds automatic sorting, searching, and pagination to the Users table.

Toastr: A JavaScript library that displays elegant, non-intrusive notifications. It's used to give users real-time feedback on their actions, such as a "User updated successfully" message.

Font Awesome: This is a popular icon library. It provides all the icons used throughout the dashboard, from the edit and delete icons to the moon and sun icons for the dark mode toggle.

Animate.css: A library of CSS animations. It adds subtle visual flair to the dashboard, such as the fade-in effect when a new section is shown or when a modal appears.

These libraries work together to provide a robust and visually appealing user experience without needing to write a lot of complex custom code.
