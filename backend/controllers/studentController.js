// controllers/studentController.js
const Student = require('../models/Student');
const path = require("path");
const fs = require("fs");

// Fetch all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate("class"); // 👈 populate class record

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

exports.getStudentByClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    console.log(classId, 'id');
    const students = await Student.find({class: classId});

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

exports.createStudent = async (req, res) => {
  try {
    let student;

    // 🔹 If updating existing student
    if (req.params.id) {
      student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
    } else {
      student = new Student();
    }

    // 🔹 Update normal fields (same as before)
    student.firstName = req.body.firstName;
    student.lastName = req.body.lastName;
    student.email = req.body.email;
    student.phone = req.body.phone;
    student.dateOfBirth = req.body.dateOfBirth;
    student.gender = req.body.gender;
    student.rollNumber = req.body.rollNumber;
    student.enrollmentDate = req.body.enrollmentDate;
    student.class = req.body.class;
    student.fee = req.body.fee;
    student.religion = req.body.religion;
    student.academicYear = req.body.academicYear;
    student.address = {
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zipCode: req.body.zipCode,
      country: req.body.country,
    };

    student.guardian = {
      name: req.body.guardianName,
      phone: req.body.guardianPhone,
      address: req.body.address,
    };

    // 🔥 IMAGE HANDLING (IMPORTANT PART)

    const deleteOldFile = (oldPath) => {
      if (!oldPath) return;
      const normalized = oldPath.replace(/\\/g, "/");
      const fullPath = path.join(__dirname, "..", normalized);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    };

    // ✅ Profile Pic
    if (req.files?.profilePic?.[0]) {
      // delete old image if exists
      if (student.profilePic) {
        deleteOldFile(student.profilePic);
      }

      student.profilePic = req.files.profilePic[0].path.replace(/\\/g, "/");
    }

    // ✅ CNIC Pic
    if (req.files?.cnicPic?.[0]) {
      if (student.cnicPic) {
        deleteOldFile(student.cnicPic);
      }

      student.cnicPic = req.files.cnicPic[0].path.replace(/\\/g, "/");
    }

    await student.save();

    res.status(req.params.id ? 200 : 201).json(student);
  } catch (err) {
    console.error("STUDENT SAVE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🔹 Update normal fields
    Object.assign(student, {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      rollNumber: req.body.rollNumber,
      enrollmentDate: req.body.enrollmentDate,
      class: req.body.class,
      fee: req.body.fee,
      religion: req.body.religion,
      academicYear: req.body.academicYear,
      status: req.body.status,
      address: {
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country,
      },
      guardian: {
        name: req.body.guardianName,
        phone: req.body.guardianPhone,
        address: req.body.address,
      },
    });

    const deleteFile = (filePath) => {
      if (!filePath) return;
      const fullPath = path.join(__dirname, "..", filePath.replace(/\\/g, "/"));
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    };

    // 🔥 PROFILE PIC UPDATE
    if (req.files?.profilePic?.[0]) {
      deleteFile(student.profilePic);
      student.profilePic = req.files.profilePic[0].path.replace(/\\/g, "/");
    }

    // 🔥 CNIC PIC UPDATE
    if (req.files?.cnicPic?.[0]) {
      deleteFile(student.cnicPic);
      student.cnicPic = req.files.cnicPic[0].path.replace(/\\/g, "/");
    }

    await student.save();

    res.json(student);
  } catch (err) {
    console.error("UPDATE STUDENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// Fetch single student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error(error);
    // handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
// fj
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    console.log(student);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 🧹 helper to delete files safely
    const deleteFile = (filePath) => {
      if (!filePath) return;

      const normalizedPath = filePath.replace(/\\/g, "/");
      const fullPath = path.join(__dirname, "..", normalizedPath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    };

    // delete images
    deleteFile(student.profilePic);
    deleteFile(student.cnicPic);

    // delete student record
    await student.deleteOne();

    res.status(200).json({ message: "Student and files deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ message: "Server error" });
  }
};