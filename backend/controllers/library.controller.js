const { LibraryBook, BookIssue, Student, db } = require('../models');

exports.getBooks = async (req, res) => {
  try {
    const books = await LibraryBook.findAll({ where: { school_id: req.schoolId } });
    res.json({ success: true, data: books });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addBook = async (req, res) => {
  try {
    const book = await LibraryBook.create({ ...req.body, school_id: req.schoolId });
    res.json({ success: true, data: book });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.issueBook = async (req, res) => {
  try {
    const { book_id, student_id, due_date } = req.body;
    
    const book = await LibraryBook.findOne({ where: { id: book_id, school_id: req.schoolId } });
    if(!book || book.copies_available < 1) throw new Error('Book not available');

    const issue = await BookIssue.create({
      school_id: req.schoolId,
      book_id,
      student_id,
      issue_date: new Date(),
      due_date,
      status: 'issued',
      issued_by: req.user.userId
    });

    await LibraryBook.decrement('copies_available', { where: { id: book_id } });

    res.json({ success: true, data: issue });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await BookIssue.findOne({ where: { id, school_id: req.schoolId } });
    if(!issue || issue.status === 'returned') throw new Error('Invalid issue record');

    // Auto calculate fine (Rs. 1 / day)
    let fine = 0;
    if (new Date() > new Date(issue.due_date)) {
      const days = Math.floor((new Date() - new Date(issue.due_date)) / (1000 * 60 * 60 * 24));
      fine = days * 1; // Rs. 1 per day
    }

    await BookIssue.update({ return_date: new Date(), status: 'returned', fine_amount: fine }, { where: { id } });
    await LibraryBook.increment('copies_available', { where: { id: issue.book_id } });

    res.json({ success: true, message: `Book returned. Fine amount: $${fine}` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getIssues = async (req, res) => {
  try {
    // If student, get only theirs
    let whereClause = { school_id: req.schoolId, status: 'issued' };
    
    if (['student', 'parent'].includes(req.user.role)) {
      let student = await Student.findOne({ where: { user_id: req.user.userId } });
      if (!student && req.user.role === 'student') {
        student = await Student.create({
          school_id: req.schoolId,
          user_id: req.user.userId,
          admission_no: `ADM-${req.user.userId}`,
          full_name: 'Demo Student',
          status: 'active'
        });
      }
      if(student) whereClause.student_id = student.id;
    }

    const issues = await BookIssue.findAll({
      where: whereClause,
      include: [LibraryBook, { model: Student, attributes: ['full_name', 'admission_no'] }]
    });

    // Auto append calculated fine for current view
    const data = issues.map(issue => {
      let fine = 0;
      if (new Date() > new Date(issue.due_date)) {
        fine = Math.floor((new Date() - new Date(issue.due_date)) / (1000 * 60 * 60 * 24)) * 1;
      }
      return { ...issue.toJSON(), current_fine: fine };
    });

    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
