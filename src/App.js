import { useState, useEffect, useRef, useReducer, useCallback } from "react"
import axios from "axios"

const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialState)

  useEffect(() => {
    localStorage.setItem(key, value)
  }, [value, key])

  return [value, setValue]
}

const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      }
    case "STORIES_FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      }
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      }
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          (story) => action.payload.objectID !== story.objectID
        ),
      }

    default:
      throw new Error()
  }
}

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query="

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "")

  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`)

  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isLoading: false,
    isError: false,
  })

  const handleSearchInput = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchSubmit = () => {
    setUrl(`${API_ENDPOINT}${searchTerm}`)
  }

  const handleFetchStories = useCallback(async () => {
    if (!searchTerm) return
    dispatchStories({ type: "STORIES_FETCH_INIT" })

    try {
      const result = await axios.get(url)
      dispatchStories({
        type: "STORIES_FETCH_SUCCESS",
        payload: result.data.hits,
      })
    } catch {
      dispatchStories({ type: "STORIES_FETCH_FAILURE" })
    }
  }, [url])

  useEffect(() => {
    handleFetchStories()
  }, [handleFetchStories])

  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    })
  }

  return (
    <>
      <h1>My Hacker Stories</h1>
      <InputWithLabel
        id='search'
        value={searchTerm}
        isFocused
        onInputChange={handleSearchInput}
      >
        <strong>Search:</strong>
      </InputWithLabel>

      <button type='button' disabled={!searchTerm} onClick={handleSearchSubmit}>
        Search
      </button>

      <hr />
      {stories.isError && <p>Error while fetching data ...</p>}
      {stories.isLoading ? (
        <p>Fetching data ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </>
  )
}

const InputWithLabel = ({
  id,
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

const List = ({ list, onRemoveItem }) => (
  <ul>
    {list.map((item) => (
      <Item key={item.objectID} item={item} onRemoveItem={onRemoveItem} />
    ))}
  </ul>
)
const Item = ({ item, onRemoveItem }) => {
  return (
    <li>
      <span>
        <a href={item.url}>{item.title} </a>
      </span>
      <span>{item.author} </span>
      <span>{item.num_comments} </span>
      <span>{item.points}</span>
      <span>
        <button type='button' onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </li>
  )
}
export default App
