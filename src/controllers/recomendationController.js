const { Educations, Recomendation, SideEffects } = require("../models");
const UserSideEffects = require("../models/userSideEffectsModel");
const { Op } = require("sequelize");

const getRecomendation = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.body;
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    let { status, id_user, tipe } =
      req.body && req.body.filter
        ? req.body.filter
        : {
            status: "active",
          };

    let whereClause = {
      status,
    };

    let EducationWhereClause = {};
    if (tipe) {
      if (tipe == "video_only") {
        EducationWhereClause.video_link = { [Op.ne]: null };
      } else if (tipe == "article_only") {
        EducationWhereClause.video_link = { [Op.eq]: null };
      } else {
        EducationWhereClause = { ...EducationWhereClause };
      }
    }

    if (!id_user) {
      id_user = req.user.id_user;
    }

    // get user side effect first
    const getUserSideEffectID = UserSideEffects.findAll({
      where: {
        id_user,
        status: "active",
      },
      attributes: ["id_user_side_effect"],
    });

    if (getUserSideEffectID && getUserSideEffectID.length) {
      getUserSideEffectID = (await getUserSideEffectID).map(
        (sideEffect) => sideEffect.id_user_side_effect
      );

      whereClause.id_side_effect = getUserSideEffectID;
    }

    const { count, rows } = await Recomendation.findAndCountAll({
      where: whereClause, // Your where condition for filtering Recomendations
      offset, // For pagination
      limit, // For pagination
      include: [
        {
          model: Educations, // Model name for Education
          as: "education", // Alias, if defined in associations
          attributes: [
            "id_education",
            "title",
            "content",
            "video_link",
            "thumbnail",
            "status",
          ], // Columns to select from Education
          where: EducationWhereClause,
        },
        {
          model: SideEffects,
          as: "side_effect",
          attributes: [
            "id_side_effect",
            "effect_name",
            "effect_detail",
            "status",
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      totalItems: count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: parseInt(page),
      data: rows,
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
  getRecomendation,
};
