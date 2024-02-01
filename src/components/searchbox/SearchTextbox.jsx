import { MdSearch } from 'react-icons/md';
import { useState, useEffect, useRef } from 'react';
import { computePosition } from '@floating-ui/dom';
import { AsyncSearchLists, SyncSearchList } from '../searchlist/SearchList';

const SearchTextbox = () => {
    const [userInput, setUserInput] = useState('');
    const [userAdvInput, setUserAdvInput] = useState('');
    const [isSynchronous, setIsSynchronous] = useState(false);
    const [isSearchListDisplayed, setIsSearchListDisplayed] = useState(false);
    const [filteredAsyncData, setFilteredAsyncData] = useState(AsyncSearchLists);
    const [checkedItems, setCheckedItems] = useState({});
    const [focusedIndex, setFocusedIndex] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [advanceSearch, setAdvanceSearch] = useState(false);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const handleWaitTime = (event) => {
        const inputText = event.target.value;
        setUserInput(inputText);
        
        setIsLoading(true);
    
        setTimeout(() => {
            const filteredData = AsyncSearchLists.filter((FilteredAsyncSearchLists) =>
                FilteredAsyncSearchLists.Name.toLowerCase().includes(inputText.toLowerCase())
            );
    
            setFilteredAsyncData(filteredData);
            setIsLoading(false);
        }, 500);
    };

    const filteredSyncData = SyncSearchList.filter((FilteredSyncSearchLists) =>
        FilteredSyncSearchLists.Name.toLowerCase().includes(userInput.toLowerCase())
    );

    useEffect(() => {
        if (isSearchListDisplayed) {
            const searchListElement = document.querySelector('#SearchList');
            const inputRefer = document.querySelector('#Input');
            
            computePosition(inputRefer, searchListElement).then(({ x, y }) => {
            Object.assign(searchListElement.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
            });
        }
        
        const handleOutsideClick = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setIsSearchListDisplayed(false);
                setFocusedIndex(null);
            }
        };

        const handleKeyDown = (event) => {
            const { key } = event;
            let listOfItems = [];
            if(isSynchronous === true) {
                listOfItems = filteredSyncData;
            } else {
                listOfItems = filteredAsyncData;
            }

            if (isSearchListDisplayed) {

                if (key === 'ArrowDown') {
                    event.preventDefault();
                    setFocusedIndex((prevIndex) =>
                        prevIndex === null || prevIndex === listOfItems.length - 1 ? 0 : prevIndex + 1
                    );
                } else if (key === 'ArrowUp') {
                    event.preventDefault();
                    setFocusedIndex((prevIndex) =>
                        prevIndex === null || prevIndex === 0 ? listOfItems.length - 1 : prevIndex - 1
                    );
                } else if (key === 'Enter') {
                    event.preventDefault();
                    if (focusedIndex !== null) {
                        const selected = listOfItems[focusedIndex];
                        handleCheckboxChange(selected.id);
                    }
                } else if (key === 'Escape') {
                    event.preventDefault();
                    if (isSearchListDisplayed === true) {
                        setIsSearchListDisplayed(false);
                    }
                }
            }

        };
        
        if (focusedIndex !== null && listRef.current) {
            const focusedItem = listRef.current.querySelector(`[data-index="${focusedIndex}"]`);
            if (focusedItem) {
                focusedItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
        
    }, [isSearchListDisplayed, focusedIndex, filteredAsyncData, filteredSyncData, isSynchronous]);
    
    const handleToggleSync = () => {
        setIsSynchronous(!isSynchronous);
        setIsSearchListDisplayed(false);
        setFocusedIndex(null);
        setCheckedItems({});
        setUserInput('');
    };

    const handleUserSynchronousInput = (event) => {
        setUserInput(event.target.value)
        setIsSearchListDisplayed(true);
        if(event.target.value === ''){
            setIsSearchListDisplayed(false);
        }
    };

    const handleUserAsynchronousInput = () => {
        setIsSearchListDisplayed(true);
    };

    const handleCheckboxChange = (index) => {
        setCheckedItems((previousCheckedItems) => ({
            ...previousCheckedItems,
            [index]: !previousCheckedItems[index]
        }));
    };

    const handleDisableInput = () => {
        setIsDisabled(!isDisabled);
    };

    const handleToggleAdvanceSearch = () => {
        setAdvanceSearch(!advanceSearch);
        setUserAdvInput('');
    };

    return(
        <div className='flex flex-col rounded-md border border-black'>
            {isSynchronous ?
            <div className='m-3'>
                <h1 className='mb-2 ml-1'>Synchronous Search</h1>
                <div ref={inputRef} className='relative w-800 flex items-center' id='Input'>
                    <MdSearch className="absolute left-0 pl-2 text-gray-500 size-8"/>
                    <input
                        className="w-full pl-8 pr-3 py-2 rounded-md border border-black"
                        type="text"
                        placeholder="Type to search"
                        value={userInput}
                        onChange={(event) => handleUserSynchronousInput(event)}
                        disabled={isDisabled}
                    />
                    {isSearchListDisplayed && 
                    <div ref={listRef} id='SearchList' className="rounded-md border border-black w-full pl-3 pr-3 ml-1 absolute top-0 left-0 bg-white shadow-lg z-10">
                        {filteredSyncData.length > 0 ? (
                            filteredSyncData.map((item) => (
                                <label key={item.id} 
                                    className={`flex items-center justify-between p-1 w-full hover:bg-gray-300 
                                    ${item.id % 2 === 1 ? 'bg-odd' : 'bg-even'}
                                    ${parseInt(item.id) === parseInt(focusedIndex) ? 'bg-focused' : ''}
                                `}>
                                    <div>{item.Name}</div>
                                    <input 
                                        className='size-4'
                                        type='checkbox'
                                        checked={checkedItems[item.id] || false}
                                        onChange={() => handleCheckboxChange(item.id)}
                                    />
                                </label>
                            ))
                        ) : (
                            <div>No items found</div>
                        )}
                    </div>}
                </div>
            </div>
            :
            <div className='m-3'>
                <h1 className='mb-2 ml-1'>Asynchronous Search</h1>
                <div ref={inputRef} className='relative w-800 flex items-center' id='Input'>
                    <MdSearch className="absolute left-0 pl-2 text-gray-500 size-8"/>
                    <input
                        className="w-full pl-8 pr-3 py-2 rounded-md border border-black"
                        type="text"
                        placeholder="Type to search"
                        value={userInput}
                        onChange={handleWaitTime}
                        onClick={handleUserAsynchronousInput}
                        disabled={isDisabled}
                    />
                    {isSearchListDisplayed && 
                    <div ref={listRef} id='SearchList' className="rounded-md border border-black w-full pl-3 pr-3 ml-1 absolute top-0 left-0 bg-white shadow-lg max-h-36 overflow-y-auto z-10">
                        {filteredAsyncData.length > 0 ? (
                            isLoading ? (
                                <div>Loading...</div>
                            ) : (
                            filteredAsyncData.map((item) => (
                            <label key={item.id} tabIndex={0} data-index={item.id}
                                className={`flex items-center justify-between p-1 max-w-3xl hover:bg-gray-300 
                                ${item.id % 2 === 1 ? 'bg-odd' : 'bg-even'} 
                                ${parseInt(item.id) === parseInt(focusedIndex) ? 'bg-focused' : ''}
                                `}
                            >
                                <div>{item.Name}</div>
                                <input 
                                    className='size-4'  
                                    type='checkbox'
                                    checked={checkedItems[item.id] || false}
                                    onChange={() => handleCheckboxChange(item.id)}
                                />
                            </label>
                        )))
                    ) : (
                        <div>No items found</div>
                    )}
                    </div>}    
                </div>
            </div>
            }
            {advanceSearch && 
                <div className='m-3'>
                    <h1 className='mb-2 ml-1'>Advance Search</h1>
                    <div className='relative w-800 flex items-center z-1'>
                        <MdSearch className="absolute left-0 pl-2 text-gray-500 size-8"/>
                        <input
                            className="w-full pl-8 pr-3 py-2 rounded-md border border-black "
                            type="text"
                            placeholder="Type in your description"
                            value={userAdvInput}
                            onChange={(event) => setUserAdvInput(event.target.value)}
                            disabled={isDisabled}
                        />
                    </div>
                </div>
            }
            <button
                className='m-1 py-1 px-1 rounded-md border border-black hover:text-white hover:bg-black' 
                onClick={handleToggleAdvanceSearch}
            >
                Advance Search
            </button>
            <div className='flex flex-row justify-center'>
                <button 
                    className='m-1 py-1 px-1 rounded-md border w-full border-black hover:text-white hover:bg-black'
                    onClick={handleDisableInput}
                >
                    {isDisabled ? 'Enable' : 'Disable'}
                </button>
                <button 
                    className='m-1 py-1 px-1 rounded-md border w-full border-black hover:text-white hover:bg-black' 
                    onClick={handleToggleSync}
                >
                    Toggle
                </button>
            </div>
        </div>
    );
};

export default SearchTextbox;