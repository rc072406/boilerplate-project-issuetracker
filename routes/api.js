'use strict';
const mongoose = require('mongoose'); // Or your DB of choice

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;
      // Requirement 5 & 6: Filter by project and any query parameters
      let filter = { project: project, ...req.query };
      
      try {
        const issues = await Issue.find(filter);
        res.json(issues);
      } catch (err) {
        res.json({ error: 'could not retrieve issues' });
      }
    })
    
    .post(async function (req, res){
  let project = req.params.project;
  const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

  if (!issue_title || !issue_text || !created_by) {
    return res.json({ error: 'required field(s) missing' });
  }

  const newIssue = new Issue({
    project: project, // Keeping this for your DB logic
    issue_title,
    issue_text,
    created_by,
    assigned_to: assigned_to || "",
    status_text: status_text || "",
    open: true,
    created_on: new Date(), // Explicitly set if your schema doesn't auto-gen
    updated_on: new Date()
  });

  try {
    const savedIssue = await newIssue.save();
    
    // Construct the response object to exclude 'project' and '__v'
    res.json({
      _id: savedIssue._id,
      issue_title: savedIssue.issue_title,
      issue_text: savedIssue.issue_text,
      created_on: savedIssue.created_on,
      updated_on: savedIssue.updated_on,
      created_by: savedIssue.created_by,
      assigned_to: savedIssue.assigned_to,
      open: savedIssue.open,
      status_text: savedIssue.status_text
    });
  } catch (err) {
    res.status(500).json({ error: 'could not save issue' });
  }
})
    
    .put(async function (req, res){
      let project = req.params.project;
      const { _id, ...updateData } = req.body;

      // Requirement 8: Missing _id
      if (!_id) return res.json({ error: 'missing _id' });

      // Requirement 9: No fields to update (excluding _id)
      const fields = Object.keys(updateData).filter(key => updateData[key] !== "");
      if (fields.length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      try {
        updateData.updated_on = new Date();
        const updated = await Issue.findByIdAndUpdate(_id, updateData, { new: true });
        
        if (!updated) throw new Error();
        res.json({ result: 'successfully updated', '_id': _id });
      } catch (err) {
        res.json({ error: 'could not update', '_id': _id });
      }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      const { _id } = req.body;

      // Requirement 10: Delete logic
      if (!_id) return res.json({ error: 'missing _id' });

      try {
        const deleted = await Issue.findByIdAndDelete(_id);
        if (!deleted) throw new Error();
        res.json({ result: 'successfully deleted', '_id': _id });
      } catch (err) {
        res.json({ error: 'could not delete', '_id': _id });
      }
    });
};
