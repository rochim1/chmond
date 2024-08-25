const { validationResult } = require("express-validator");
const Educations = require("../models/educationModel");
const Recomendation = require("../models/recomendationModel");
const fs = require("fs");
const path = require("path");

// Create Education
const createEducation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: "BAD_REQUEST",
        error: errors.array(),
      });
    }

    const { title, content, video_link, id_side_effects, thumbnail_base64 } =
      req.body;
    let thumbnail = null;

    if (
      !id_side_effects ||
      !Array.isArray(id_side_effects) ||
      id_side_effects.length === 0
    ) {
      return res.status(400).json({
        success: false,
        code: "BAD_REQUEST",
        error: {
          message: "At least one Side Effect ID is required",
        },
      });
    }

    // Handle file upload
    // if (req.file) {
    //     thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    // }
    let thumbnailPath = null;
    if (thumbnail_base64) {
      // Decode base64 string
      const base64Data = thumbnail_base64.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const buffer = Buffer.from(base64Data, "base64");

      // Generate a unique filename
      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.jpg`;
      const filePath = path.join(
        __dirname,
        "../..",
        "uploads",
        "thumbnails",
        filename
      );

      // Save the file
      fs.writeFileSync(filePath, buffer);
      thumbnailPath = `/uploads/thumbnails/${filename}`;
    }

    const newEducation = await Educations.create({
      title,
      content,
      video_link,
      // thumbnail,
      thumbnail: thumbnailPath,
    });

    if (
      id_side_effects &&
      (Array.isArray(id_side_effects) || id_side_effects.length >= 0)
    ) {
      const recommendations = id_side_effects.map((id_side_effect) => ({
        id_side_effect,
        id_education: newEducation.id_education,
      }));
      await Recomendation.bulkCreate(recommendations);
    }

    return res.status(201).json({
      success: true,
      message: "Education created successfully",
      data: newEducation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: {
        message: error.message,
      },
    });
  }
};

// Get One Education
const getOneEducation = async (req, res) => {
  try {
    const { id_education } = req.params;

    const education = await Educations.findOne({
      where: {
        id_education,
        status: "active",
      },
    });

    if (!education) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: {
          message: "Education not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: education,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: {
        message: error.message,
      },
    });
  }
};

// Get All Educations with Pagination
const getAllEducations = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.body;
    const { status, tipe } = req.body.filter || {
      status: "active",
    };

    let EducationWhereClause = {
      status
    };
    if (tipe) {
      if (tipe == "video_only") {
        EducationWhereClause.video_link = { [Op.ne]: null };
      } else if (tipe == "article_only") {
        EducationWhereClause.video_link = { [Op.eq]: null };
      } else {
        EducationWhereClause = { ...EducationWhereClause };
      }
    }

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const educations = await Educations.findAndCountAll({
      where: EducationWhereClause,
      offset,
      limit,
    });

    return res.status(200).json({
      success: true,
      totalItems: educations.count,
      totalPages: Math.ceil(educations.count / pageSize),
      currentPage: parseInt(page),
      educations: educations.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: {
        message: error.message,
      },
    });
  }
};

// Update Education
const updateEducation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        code: "BAD_REQUEST",
        error: errors.array(),
      });
    }

    const { id_education } = req.params; // Get education ID from params
    const {
      title,
      content,
      video_link,
      // status,
      thumbnail_base64,
      id_side_effects,
      remove_thumbnail, // New form-data field for removing thumbnail
    } = req.body;

    // Check if education exists
    const education = await Educations.findOne({
      where: {
        id_education,
        status: "active",
      },
    });

    if (
      id_side_effects &&
      Array.isArray(id_side_effects) &&
      id_side_effects.length > 0
    ) {
      // Fetch existing recommendations for the given education
      const existingRecommendations = await Recomendation.findAll({
        where: {
          id_education: education.id_education,
          status: "active",
        },
        attributes: ["id_side_effect"], // Fetch only the `id_side_effect` field
      });

      // Extract the existing side effect IDs
      const existingSideEffectIds = existingRecommendations.map(
        (rec) => rec.id_side_effect
      );

      // Filter out the new side effects that do not already exist
      const newSideEffects = id_side_effects.filter(
        (id_side_effect) => !existingSideEffectIds.includes(id_side_effect)
      );
      const deletedSideEffects = existingSideEffectIds.filter(
        (exist_side_effect) => !id_side_effects.includes(exist_side_effect)
      );

      // If there are deleted side effects, remove them from recommendations
      if (deletedSideEffects.length > 0) {
        await Recomendation.destroy({
          where: {
            id_education: education.id_education,
            id_side_effect: deletedSideEffects,
          },
        });
      }

      // If there are new side effects, create recommendations for them
      if (newSideEffects.length > 0) {
        const newRecommendations = newSideEffects.map((id_side_effect) => ({
          id_side_effect,
          id_education: education.id_education,
        }));

        await Recomendation.bulkCreate(newRecommendations);
      }
    }

    if (!education) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: {
          message: "Education not found",
        },
      });
    }

    // Handle file upload (if a new thumbnail is uploaded)
    let thumbnailPath = education.thumbnail; // Use the existing thumbnail if none is uploaded
    // if (req.file) {
    //     thumbnailPath = req.file.path; // Update with the new thumbnail path
    // }
    if (thumbnail_base64 && !remove_thumbnail) {
      // Remove old thumbnail if exists
      if (education.thumbnail) {
        const oldFilePath = path.join(
          __dirname,
          "../..",
          "uploads",
          "thumbnails",
          path.basename(education.thumbnail)
        );
        fs.unlink(oldFilePath, (err) => {
          if (err) {
            console.error("Error removing old thumbnail file:", err);
          }
        });
      }

      // Decode base64 string
      const base64Data = thumbnail_base64.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const buffer = Buffer.from(base64Data, "base64");

      // Generate a unique filename
      const filename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}.jpg`;
      const filePath = path.join(
        __dirname,
        "../..",
        "uploads",
        "thumbnails",
        filename
      );

      // Save the file
      fs.writeFileSync(filePath, buffer);
      thumbnailPath = `/uploads/thumbnails/${filename}`;
    }

    // Handle removal of the thumbnail if requested
    if (remove_thumbnail == true) {
      if (education.thumbnail) {
        const filePath = path.join(
          __dirname,
          "../..",
          "uploads",
          "thumbnails",
          path.basename(education.thumbnail)
        );
        // Update the path to point directly to the correct directory
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error removing thumbnail file:", err);
          } else {
            console.log("Thumbnail file removed successfully");
          }
        });
        thumbnailPath = null;
      }
    }

    // Update the education record
    await education.update({
      title,
      content,
      video_link,
      thumbnail: thumbnailPath, // Use the new or existing (or null if removed) thumbnail path
      // status,
    });

    return res.status(200).json({
      success: true,
      message: "Education updated successfully",
      data: education,
    });
  } catch (error) {
    console.error("Error updating education:", error);
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: {
        message: error.message,
      },
    });
  }
};

// Soft Delete Education
const deleteEducation = async (req, res) => {
  try {
    const { id_education } = req.params;

    const education = await Educations.findOne({
      where: {
        id_education,
        status: "active",
      },
    });

    if (!education) {
      return res.status(404).json({
        success: false,
        code: "NOT_FOUND",
        error: {
          message: "Education not found",
        },
      });
    }

    if (education.thumbnail) {
      const filePath = path.join(
        __dirname,
        "../..",
        "uploads",
        "thumbnails",
        path.basename(education.thumbnail)
      );
      // Update the path to point directly to the correct directory
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error removing thumbnail file:", err);
        } else {
          console.log("Thumbnail file removed successfully");
        }
      });
      thumbnailPath = null;
    }

    await education.update({
      status: "deleted",
    });

    // Update related recommendations to 'deleted'
    await Recomendation.update(
      { status: "deleted", deletedAt: new Date() },
      { where: { id_education, status: "active" } }
    );

    return res.status(200).json({
      success: true,
      message: "Education deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      error: {
        message: error.message,
      },
    });
  }
};

module.exports = {
  createEducation,
  getOneEducation,
  getAllEducations,
  updateEducation,
  deleteEducation,
};
