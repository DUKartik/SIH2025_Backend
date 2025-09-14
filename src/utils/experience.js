const addExperience = async (Model, parentId, expData) => {
  return await Model.findByIdAndUpdate(
    parentId,
    { $push: { experience: expData } },
    { new: true, runValidators: true }
  );
};

const getExperiences = async (Model, parentId) => {
  const doc = await Model.findById(parentId).select("experience");
  return doc ? doc.experience : null;
};

const updateExperience = async (Model, parentId, expId, updates) => {
  return await Model.findOneAndUpdate(
    { _id: parentId, "experience._id": expId },
    { $set: { "experience.$": updates } },
    { new: true, runValidators: true }
  );
};

const deleteExperience = async (Model, parentId, expId) => {
  return await Model.findByIdAndUpdate(
    parentId,
    { $pull: { experience: { _id: expId } } },
    { new: true }
  );
};

export {
    addExperience,
    getExperiences,
    updateExperience,
    deleteExperience
}
