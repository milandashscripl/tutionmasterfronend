import { useState, useEffect } from "react";
import API from "../api/api";
import { toast } from "react-toastify";

const Chapters = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    standard: '',
    board: '',
    medium: '',
    search: ''
  });
  const [filterOptions, setFilterOptions] = useState({});
  const [showCreateChapter, setShowCreateChapter] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState({
    subject: '',
    standard: '',
    board: '',
    medium: 'english',
    chapterName: '',
    chapterNumber: '',
    description: '',
    topics: [],
    estimatedHours: 1,
    difficulty: 'medium'
  });

  useEffect(() => {
    fetchChapters();
    fetchFilterOptions();
  }, [filters]);

  const fetchChapters = async () => {
    try {
      const response = await API.get('/chapters', {
        params: filters
      });
      setChapters(response.data.chapters);
    } catch (error) {
      toast.error("Failed to fetch chapters");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await API.get('/chapters/filters');
      setFilterOptions(response.data.filters);
    } catch (error) {
      console.error("Failed to fetch filter options");
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    try {
      await API.post('/chapters', chapterForm);
      toast.success("Chapter created successfully");
      setShowCreateChapter(false);
      resetForm();
      fetchChapters();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create chapter");
    }
  };

  const handleUpdateChapter = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/chapters/${editingChapter._id}`, chapterForm);
      toast.success("Chapter updated successfully");
      setEditingChapter(null);
      resetForm();
      fetchChapters();
    } catch (error) {
      toast.error("Failed to update chapter");
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await API.delete(`/chapters/${chapterId}`);
      toast.success("Chapter deleted successfully");
      fetchChapters();
    } catch (error) {
      toast.error("Failed to delete chapter");
    }
  };

  const resetForm = () => {
    setChapterForm({
      subject: '',
      standard: '',
      board: '',
      medium: 'english',
      chapterName: '',
      chapterNumber: '',
      description: '',
      topics: [],
      estimatedHours: 1,
      difficulty: 'medium'
    });
  };

  const startEdit = (chapter) => {
    setEditingChapter(chapter);
    setChapterForm({
      subject: chapter.subject,
      standard: chapter.standard,
      board: chapter.board,
      medium: chapter.medium,
      chapterName: chapter.chapterName,
      chapterNumber: chapter.chapterNumber,
      description: chapter.description || '',
      topics: chapter.topics || [],
      estimatedHours: chapter.estimatedHours,
      difficulty: chapter.difficulty
    });
  };

  const addTopic = () => {
    setChapterForm({
      ...chapterForm,
      topics: [...chapterForm.topics, '']
    });
  };

  const updateTopic = (index, value) => {
    const newTopics = [...chapterForm.topics];
    newTopics[index] = value;
    setChapterForm({
      ...chapterForm,
      topics: newTopics
    });
  };

  const removeTopic = (index) => {
    setChapterForm({
      ...chapterForm,
      topics: chapterForm.topics.filter((_, i) => i !== index)
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Chapter Management</h1>

        {/* Action Buttons */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateChapter(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create New Chapter
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Subjects</option>
              {filterOptions.subjects?.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={filters.standard}
              onChange={(e) => setFilters({...filters, standard: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Standards</option>
              {filterOptions.standards?.map(standard => (
                <option key={standard} value={standard}>{standard}</option>
              ))}
            </select>

            <select
              value={filters.board}
              onChange={(e) => setFilters({...filters, board: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Boards</option>
              {filterOptions.boards?.map(board => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>

            <select
              value={filters.medium}
              onChange={(e) => setFilters({...filters, medium: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Mediums</option>
              {filterOptions.mediums?.map(medium => (
                <option key={medium} value={medium}>{medium.charAt(0).toUpperCase() + medium.slice(1)}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search chapters..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Chapters Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chapter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Board
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chapters.map((chapter) => (
                  <tr key={chapter._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {chapter.chapterNumber}. {chapter.chapterName}
                        </div>
                        {chapter.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {chapter.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {chapter.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {chapter.standard}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {chapter.board}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {chapter.medium}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(chapter.difficulty)}`}>
                        {chapter.difficulty.charAt(0).toUpperCase() + chapter.difficulty.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {chapter.estimatedHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(chapter)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {chapters.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No chapters found for the selected filters.
            </div>
          )}
        </div>

        {/* Create/Edit Chapter Modal */}
        {(showCreateChapter || editingChapter) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">
                {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
              </h2>
              <form onSubmit={editingChapter ? handleUpdateChapter : handleCreateChapter} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      value={chapterForm.subject}
                      onChange={(e) => setChapterForm({...chapterForm, subject: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Standard</label>
                    <input
                      type="text"
                      value={chapterForm.standard}
                      onChange={(e) => setChapterForm({...chapterForm, standard: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Board</label>
                    <input
                      type="text"
                      value={chapterForm.board}
                      onChange={(e) => setChapterForm({...chapterForm, board: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Medium</label>
                    <select
                      value={chapterForm.medium}
                      onChange={(e) => setChapterForm({...chapterForm, medium: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="english">English</option>
                      <option value="hindi">Hindi</option>
                      <option value="odia">Odia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chapter Name</label>
                    <input
                      type="text"
                      value={chapterForm.chapterName}
                      onChange={(e) => setChapterForm({...chapterForm, chapterName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chapter Number</label>
                    <input
                      type="number"
                      value={chapterForm.chapterNumber}
                      onChange={(e) => setChapterForm({...chapterForm, chapterNumber: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={chapterForm.description}
                    onChange={(e) => setChapterForm({...chapterForm, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
                  {chapterForm.topics.map((topic, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => updateTopic(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                        placeholder="Enter topic"
                      />
                      <button
                        type="button"
                        onClick={() => removeTopic(index)}
                        className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addTopic}
                    className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700"
                  >
                    Add Topic
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estimated Hours</label>
                    <input
                      type="number"
                      value={chapterForm.estimatedHours}
                      onChange={(e) => setChapterForm({...chapterForm, estimatedHours: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                      value={chapterForm.difficulty}
                      onChange={(e) => setChapterForm({...chapterForm, difficulty: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    {editingChapter ? 'Update Chapter' : 'Create Chapter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateChapter(false);
                      setEditingChapter(null);
                      resetForm();
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chapters;