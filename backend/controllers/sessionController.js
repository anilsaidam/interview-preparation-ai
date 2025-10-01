const Session = require("../models/Session");
const Question = require("../models/Question");

exports.createSession = async (req, res) => {
    try {
        const {
            role,
            experience,
            topicsToFocus,
            description,
            questions,
            resumePath,
        } = req.body;
        const userId = req.user._id;

        const session = await Session.create({
            user: userId,
            role,
            experience,
            topicsToFocus,
            description,
            resumePath,
        });

        const questionDocs = await Promise.all(
            questions.map(async (q) => {
                const question = await Question.create({
                    session: session._id,
                    question: q.question,
                    answer: q.answer,
                });
                return question._id;
            })
        );

        session.questions = questionDocs;
        await session.save();

        res.status(201).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.getMySessions = async (req, res) => {
    try {
        const sessions = await Session.find({ 
            user: req.user.id,
            deleted: { $ne: true }
        })
            .sort({ createdAt: -1 })
            .populate("questions");
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get session statistics
exports.getSessionStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Count all sessions created by user (including deleted ones for historical total)
        const createdCount = await Session.countDocuments({ user: userId });

        // Count active sessions (non-deleted with questions)
        const activeCount = await Session.countDocuments({
            user: userId,
            deleted: { $ne: true },
            questions: { $exists: true, $not: { $size: 0 } }
        });

        // Count completed sessions (non-deleted)
        const completedCount = await Session.countDocuments({
            user: userId,
            deleted: { $ne: true },
            completed: true
        });

        // Calculate total pinned questions across all active sessions
        const sessions = await Session.find({ 
            user: userId,
            deleted: { $ne: true }
        }).populate('questions');
        const pinnedCount = sessions.reduce((total, session) => {
            return total + (session.questions?.filter(q => q.isPinned)?.length || 0);
        }, 0);

        return res.status(200).json({
            createdCount,
            activeCount,
            completedCount,
            pinnedCount,
            successStreak: completedCount
        });
    } catch (error) {
        console.error('[ERROR] Get session stats:', error);
        return res.status(500).json({
            message: 'Failed to get statistics',
            error: error.message,
        });
    }
};

// Toggle session completion status
exports.toggleSessionComplete = async (req, res) => {
    try {
        const { id } = req.params;

        const session = await Session.findOne({
            _id: id,
            user: req.user._id,
        });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        session.completed = !session.completed;
        await session.save();

        return res.status(200).json({
            message: session.completed ? "Session marked as completed" : "Session marked as incomplete",
            session
        });
    } catch (error) {
        console.error('[ERROR] Toggle session complete:', error);
        return res.status(500).json({
            message: "Failed to update session status",
            error: error.message,
        });
    }
};

exports.getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate({
                path: "questions",
                options: { sort: { isPinned: -1, createdAt: 1 } },
            })
            .exec();
        if (!session) {
            return res
                .status(404)
                .json({ success: false, message: "Session not found" });
        }

        res.status(200).json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        // Check if the logged-in user owns this session
        if (session.user.toString() != req.user.id) {
            return res
                .status(401)
                .json({ message: "Not authorized to delete this session" });
        }

        // Soft delete - mark as deleted but keep for historical count
        session.deleted = true;
        await session.save();

        res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
        console.error('[ERROR] Delete session:', error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
