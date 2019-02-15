import React, { useState, useEffect } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';
import aws_exports from './aws-exports';
import { withAuthenticator } from 'aws-amplify-react';
import { listNotes } from './graphql/queries';
import { createNote, updateNote , deleteNote} from './graphql/mutations';
Amplify.configure(aws_exports)



 
const App = () => {
  const [notes, setNotes] = useState([])
  const [note, setNote] = useState("");
  const [noteId, setNoteId] = useState('');
  const [noteIndex, setNoteIndex] = useState('');
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    handleListNotes()
  }, [])
  
  // Get all list Notes
  const handleListNotes = async () => {
    const { data } = await API.graphql(graphqlOperation(listNotes))
    console.log(data)
    setNotes(data.listNotes.items)
  }



  const hasExistingNote = () => {
    if (noteId) {
      const isNote = notes.findIndex(note => note.id === noteId) > -1
      return isNote;
    }
    return false;
  }


  const hasNote = () => {
    if (note.trim()) {
      return true;
    }
    return false;
  } 


  // Update Note
  const handleUpdateNote = async () => {
    const payload = { id: noteId, note }
    const { data } = await API.graphql(graphqlOperation(updateNote, { input: payload }))
    const updatedNote = data.updateNote;

    const updatedNotes = [
      ...notes.slice(0, noteIndex),
      updatedNote,
      ...notes.slice(noteIndex + 1)
    ]

    setNotes(updatedNotes)
    setNote("")
    setNoteId('')
  }



  // Delete Note
  const handleDelete = async id => {
    setDeletingId(id)
    const payload = { id };
    const { data } = await API.graphql(graphqlOperation(deleteNote, { input: payload }))

    const deletedNoteId = data.deleteNote.id;
    const deletedNoteIndex = notes.findIndex(note => note.id === deletedNoteId)

    const updatedNotes = [
      ...notes.slice(0, deletedNoteIndex),
      ...notes.slice(deletedNoteIndex + 1)
    ];

    setNotes(updatedNotes)
    setDeletingId(""); 
  }


  // Add Note
  const handleAddNote = async event => {
    event.preventDefault()

    if (hasExistingNote()) {
      // update note
      handleUpdateNote()

    } else if (hasNote()) {
      const payload = { note };
      const { data } = await API.graphql(graphqlOperation(createNote, { input: payload }))
  
      const newNote = data.createNote;
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      setNote("");

    }
  }


  const handleSetNote = ({ note, id }, index) => {
    setNote(note)
    setNoteId(id)
    setNoteIndex(index)
  }

  return (
    <div className="flex flex-column items-center justify-center bg-washed-red pa3">
      <h1 className="code f2">Amplify Notetaker</h1>
      
      <form onSubmit={handleAddNote} className="mb3">
        <input 
          type="text" 
          placeholder="Write your note" 
          className="pa2 f4" 
          value={note}
          onChange={({ target }) => setNote(target.value)}
          />
        <button type="submit" className="pa2 f4">
          {noteId ? "Update" : "Add"} 
        </button>
      
      </form>


      <div>
        {notes.map((item, i) => (
          <div key={item.id} className="flex items-center">
            <li className="list pa1 f3" 
              style={{ color: deletingId === item.id && "red" }}
              onClick={() => handleSetNote(item, i)}>
              {item.note}
            </li>
            <button onClick={() => handleDelete(item.id)} className="bg-transparent bn f4">
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default withAuthenticator(App, { includeGreetings: true });
