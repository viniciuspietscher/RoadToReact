import { useState, useEffect, useRef } from "react"

const useStorageState = (key, initialState) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState)

  useEffect(() => {
    localStorage.setItem(key, value)
  }, [value, key])

  return [value, setValue]
}

const App = () => {
  const stories = [
    {
      title: "React",
      url: "https://reactjs.org/",
      author: "Jordan Walke",
      num_comments: 3,
      points: 4,
      objectID: 0,
    },
    {
      title: "Redux",
      url: "https://redux.js.org/",
      author: "Dan Abramov, Andrew Clark",
      num_comments: 2,
      points: 5,
      objectID: 1,
    },
    {
      title: "Vue",
      url: "https://vuejs.org/",
      author: "Evan You",
      num_comments: 2,
      points: 5,
      objectID: 2,
    },
    {
      title: "Angular",
      url: "https://angular.io/",
      author: "Google",
      num_comments: 2,
      points: 5,
      objectID: 3,
    },
  ]

  const [searchTerm, setSearchTerm] = useStorageState("search", "react")

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLocaleLowerCase())
  )

  return (
    <>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id='search'
        value={searchTerm}
        isFocused
        onInputChange={handleSearch}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <hr />
      <List list={searchedStories} />
    </>
  )
}

const InputWithLabel = ({
  id,
  label,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = useRef()
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])
  return (
    <>
      <label htmlFor={id}>{children} </label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        autoFocus={isFocused}
        onChange={onInputChange}
      />
    </>
  )
}

const List = ({ list }) => (
  <ul>
    {list.map(({ objectID, ...item }) => (
      <Item key={objectID} {...item} />
    ))}
  </ul>
)
const Item = ({ url, title, author, num_comments, points }) => (
  <li>
    <span>
      <a href={url}>{title} </a>
    </span>
    <span>{author} </span>
    <span>{num_comments} </span>
    <span>{points}</span>
  </li>
)
export default App
