import React, { useState, useEffect } from "react";

const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    // Fetch comments from an API related to this product
    fetchComments(productId);
  }, [productId]);

  const fetchComments = (productId) => {
    // Simulate an API call to get comments
    const mockComments = [
      {
        id: 1,
        username: "John Doe",
        text: "This product is amazing!",
        image: "https://example.com/image1.jpg",
        date: "2024-09-29 10:34 AM",
      },
      {
        id: 2,
        username: "Jane Smith",
        text: "I had a good experience with this.",
        date: "2024-09-28 9:15 AM",
      },
    ];
    setComments(mockComments);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const newComment = {
      id: comments.length + 1,
      username: "Anonymous", // Replace with actual username
      text: commentText,
      image: image ? URL.createObjectURL(image) : null,
      date: new Date().toLocaleString(),
    };
    setComments([...comments, newComment]);
    setCommentText("");
    setImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  return (
    <div className="comment-section">
      {/* Comment Form */}
      <form
        onSubmit={handleCommentSubmit}
        className="comment-form space-y-2 mb-6"
      >
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write your comment..."
          className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring focus:border-blue-300"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg"
        >
          Submit
        </button>
      </form>

      {/* Display Comments */}
      <div className="comment-list space-y-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="comment-item p-4 border rounded-lg shadow-sm bg-white"
          >
            {/* Username */}
            <div className="font-semibold text-gray-900">
              {comment.username}
            </div>
            {/* Comment Text */}
            <p className="text-gray-700">{comment.text}</p>
            {/* Image if exists */}
            {comment.image && (
              <img
                src={comment.image}
                alt="Comment"
                className="mt-2 rounded-lg max-w-full h-auto"
              />
            )}
            {/* Date */}
            <span className="text-gray-500 text-sm">{comment.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
