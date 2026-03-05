import { useState } from 'react';
import { MessageSquare, Lightbulb, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { RatingStars } from './RatingStars';

interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  type: 'comment' | 'suggestion';
  text: string;
  date: string;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment?: (comment: { type: 'comment' | 'suggestion'; text: string; rating: number }) => void;
}

export function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'comment' | 'suggestion'>('comment');
  const [userRating, setUserRating] = useState(5);

  const handleSubmit = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment({ type: commentType, text: newComment, rating: userRating });
      setNewComment('');
      setUserRating(5);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-900">Reviews & Suggestions</h3>
        <span className="text-sm text-gray-500 ml-auto">{comments.length} total</span>
      </div>

      {/* Add Comment Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setCommentType('comment')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              commentType === 'comment'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Comment
          </button>
          <button
            onClick={() => setCommentType('suggestion')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
              commentType === 'suggestion'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Lightbulb className="w-4 h-4 inline mr-2" />
            Suggestion
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
          <RatingStars rating={userRating} onRatingChange={setUserRating} />
        </div>

        <Textarea
          placeholder={
            commentType === 'comment'
              ? 'Share your experience with this recipe...'
              : 'Suggest improvements or variations...'
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] mb-3 rounded-xl border-gray-200 focus:border-amber-500 focus:ring-amber-500"
        />

        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim()}
          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl"
        >
          <Send className="w-4 h-4 mr-2" />
          Post {commentType === 'comment' ? 'Comment' : 'Suggestion'}
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-xl border-2 ${
              comment.type === 'suggestion'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{comment.userName}</h4>
                  {comment.type === 'suggestion' && (
                    <span className="flex items-center gap-1 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                      <Lightbulb className="w-3 h-3" />
                      Suggestion
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <RatingStars rating={comment.rating} readonly size="sm" />
                  <span className="text-xs text-gray-500">{comment.date}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
