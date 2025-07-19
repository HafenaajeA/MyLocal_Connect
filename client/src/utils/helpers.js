import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date) => {
  const dateObj = new Date(date);
  return format(dateObj, 'PPP');
};

export const formatRelativeDate = (date) => {
  const dateObj = new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getInitials = (firstName, lastName) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
