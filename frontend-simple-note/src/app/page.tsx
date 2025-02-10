"use client"

import { useEffect, useState } from "react";

interface Note {
  id: number;
  title: string;
  content: string;
  isDeleted?: boolean;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [showDeleted]);

  const fetchNotes = async () => {
    try {
      const endpoint = showDeleted ? 'http://localhost:3000/notes/deleted' : 'http://localhost:3000/notes';
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log('Fetched notes:', data);
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Error fetching notes:', error);
      setNotes([])
    }
  };

  const createNote = async () => {
    const newNote = { title, content };
    try {
      await fetch('http://localhost:3000/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });
      fetchNotes();
      setTitle("");
      setContent("");
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const editNote = async (id: number) => {
    const updatedNote = { title, content };
    try {
      await fetch(`http://localhost:3000/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNote),
      });
      fetchNotes();
      setTitle("");
      setContent("");
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/notes/${id}`, {
        method: 'DELETE',
      });
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const restoreNote = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/notes/restore/${id}`, {
        method: 'POST',
      });
      fetchNotes();
    } catch (error) {
      console.error('Error restoring note:', error);
    }
  };

  const handleEditClick = (note: Note) => {
    setTitle(note.title);
    setContent(note.content);
    setEditingNoteId(note.id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notes App</h1>
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className="px-4 py-2 text-sm font-medium text-black bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {showDeleted ? 'Show Active Notes' : 'Show Deleted Notes'}
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            editingNoteId ? editNote(editingNoteId) : createNote();
          }}
          className="mb-8 space-y-4"
        >
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
              required
              className="w-full text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Note Content"
              required
              rows={4}
              className="w-full text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {editingNoteId ? "Update Note" : "Create Note"}
          </button>
        </form>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 p-4">
            {notes
              .filter(note => note.isDeleted === showDeleted)
              .map((note) => (
                <div
                  key={note.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{note.content}</p>
                  <div className="flex gap-2">
                    {!note.isDeleted ? (
                      <>
                        <button
                          onClick={() => handleEditClick(note)}
                          className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => restoreNote(note.id)}
                        className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
