import { socket } from '../api/socket';
import { SOCKET_EVENTS } from '../utils/socketEvents';

export const initializeSocketListeners = ({
  fetchPosts,
  fetchAnalytics,
  setLikeCounts,
  setPosts
}) => {

  socket.on('connect', () => {
    console.log('Connected:', socket.id);
  });

  // NEW POST
  socket.on(SOCKET_EVENTS.POST_CREATED, () => {
    fetchPosts();
  });

  // LIVE LIKES
  socket.on(SOCKET_EVENTS.POST_LIKED, (data) => {

    setLikeCounts((prev) => ({
      ...prev,
      [data.postId]: data.likes
    }));

  });

  // LIVE VIEWS
  socket.on(SOCKET_EVENTS.POST_VIEWED, (data) => {

    setPosts((prev) =>
      prev.map((post) =>
        post._id === data.postId
          ? {
              ...post,
              metrics: {
                ...post.metrics,
                views: data.views
              }
            }
          : post
      )
    );

  });

  // GLOBAL DASHBOARD REFRESH
  socket.on(SOCKET_EVENTS.DASHBOARD_UPDATE, () => {

    fetchAnalytics?.();

  });

};

export const removeSocketListeners = () => {

  socket.off('connect');

  socket.off(SOCKET_EVENTS.POST_CREATED);

  socket.off(SOCKET_EVENTS.POST_LIKED);

  socket.off(SOCKET_EVENTS.POST_VIEWED);

  socket.off(SOCKET_EVENTS.DASHBOARD_UPDATE);

};




// POST-SCOPED LISTENERS — for a single post's detail page
export const initializePostSocketListeners = ({
  postId,
  setLikeCount,
  setPost,
  onNewComment
}) => {

  socket.on(SOCKET_EVENTS.POST_LIKED, (data) => {
    if (data.postId !== postId) return;
    setLikeCount(data.likes);
  });

  socket.on(SOCKET_EVENTS.POST_VIEWED, (data) => {
    if (data.postId !== postId) return;
    setPost((prev) =>
      prev ? { ...prev, metrics: { ...prev.metrics, views: data.views } } : prev
    );
  });

  socket.on(SOCKET_EVENTS.NEW_COMMENT, (data) => {
    if (data.postId !== postId) return;
    onNewComment?.(data.comment);
  });

};

export const removePostSocketListeners = () => {
  socket.off(SOCKET_EVENTS.POST_LIKED);
  socket.off(SOCKET_EVENTS.POST_VIEWED);
  socket.off(SOCKET_EVENTS.NEW_COMMENT);
};