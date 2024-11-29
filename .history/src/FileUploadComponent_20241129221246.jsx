import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from './Loader'; // Assuming the loader is in the same folder
import '../index.css'
const FileUploadComponent = () => {
    const [fileNames, setFileNames] = useState([]);
    const [uploadedFileUri, setUploadedFileUri] = useState('');
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false); // For handling the loader
    const [conversation, setConversation] = useState([]); // Chat history
    const [sessionId, setSessionId] = useState('');
    const [uploadUrl, setUploadUrl] = useState(''); // For upload URL input

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const fileNamesList = files.map((file) => file.name);
        setFileNames(fileNamesList);
    };

    const handleUploadUrl = async (e) => {
        e.preventDefault()
        const bodyType = {
            url: uploadUrl
        }

        setLoading(true); // Show loader while fetching chat response

        try {
            const response = await fetch('http://localhost:5000/uploadUrl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyType), // Serialize the object to JSON
            });

            if (!response.ok) {
                throw new Error('Failed to get an answer from the server.');
            }

            const data = await response.json(); // Parse the JSON response
            console.log(data);

            const botMessage = { role: 'bot', text: data.text };
            setConversation((prev) => [...prev, botMessage]); // Add bot's response to chat
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false); // Hide the loader
        }

    }
    const handleFileUpload = async () => {
        const fileInput = document.getElementById('fileInput');
        const files = fileInput.files;

        if (!files.length) {
            alert('Please select at least one file before uploading.');
            return;
        }

        setLoading(true); // Show loader during file upload

        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('files', file));

        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to upload file: ${response.status}`);
            }

            const result = await response.json();
            setUploadedFileUri(result.fileUri);
            setSessionId(result.sessionId);
            alert('Files uploaded successfully.');
        } catch (error) {
            console.error('Error during file upload:', error);
            alert('Failed to upload files.');
        } finally {
            setLoading(false); // Hide loader once upload is done
        }
    };

    const handleAsk = async (e) => {
        e.preventDefault();

        if (!question.trim()) {
            alert('Please enter a question.');
            return;
        }

        const userMessage = { role: 'user', text: question };
        setConversation((prev) => [...prev, userMessage]); // Add user's question to chat

        const bodyType = {
            question: question,
            sessionId: sessionId,
        };

        setLoading(true); // Show loader while fetching chat response

        try {
            const response = await fetch('http://localhost:5000/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyType), // Serialize the object to JSON
            });

            if (!response.ok) {
                throw new Error('Failed to get an answer from the server.');
            }

            const data = await response.json(); // Parse the JSON response
            console.log(data);

            const botMessage = { role: 'bot', text: data.text };
            setConversation((prev) => [...prev, botMessage]); // Add bot's response to chat
        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false); // Hide the loader
        }

        setQuestion(''); // Clear the input field
    };

    return (
        <div className="flex flex-col md:flex-row h-screen p-4 sm:p-6 bg-gradient-to-br from-[#060606] via-[#111829] to-[#060606]">
            {/* Left Side: File Upload Section */}
            <div className="w-full md:w-1/4 bg-gray-900 shadow-lg rounded-lg p-4 sm:p-6 mb-6 md:mb-0 md:mr-6 border border-gray-700">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-200">Upload Single PDF or Multiple PDFs</h2>
                <form id="uploadForm" encType="multipart/form-data" className="mb-6">
                    <input
                        type="file"
                        id="fileInput"
                        name="file"
                        accept="*/*"
                        multiple
                        onChange={handleFileChange}
                        className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded w-full text-gray-300"
                    />
                    <button
                        type="button"
                        onClick={handleFileUpload}
                        className="w-full bg-gradient-to-r from-[#a290ff] to-[#098dfb] text-white px-4 py-2 rounded hover:opacity-90 transition"
                    >
                        Upload Files
                    </button>
                    {fileNames.length > 0 && (
                        <div className="mt-4 text-sm text-gray-400">
                            <h3>Selected Files:</h3>
                            <ul>
                                {fileNames.map((name, index) => (
                                    <li key={index}>{name}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </form>

                {/* Upload URL Section */}
                <div className="mt-6">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-200">Upload URL or Multiple URLS with commas</h2>
                    <input
                        type="text"
                        value={uploadUrl}
                        onChange={(e) => setUploadUrl(e.target.value)}
                        placeholder="Enter a file URL..."
                        className="w-full bg-gray-800 text-gray-200 border border-gray-600 rounded-lg p-3 mb-4 shadow-inner focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button
                        type="button"
                        className="w-full bg-gradient-to-r from-[#a290ff] to-[#098dfb] text-white px-4 py-2 rounded hover:opacity-90 transition"
                        onClick={() => handleUploadUrl}
                    >
                        Upload URL
                    </button>
                </div>
            </div>

            {/* Right Side: Chat Interface Section */}
            <div className="w-full md:w-3/4 bg-gray-900 shadow-lg rounded-lg p-4 sm:p-6 flex flex-col justify-between border border-gray-700">
                <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-200">AI Chat Assistant</h2>
                    <div className="flex-1  p-4 sm:p-6 rounded-lg overflow-y-auto shadow-inner custom-scrollbar" style={{ maxHeight: '70vh' }}>
                        {loading && <Loader />} {/* Show loader while loading */}
                        <div>
                            {conversation.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start mb-4 ${msg.role === 'bot' ? 'flex-row' : 'flex-row-reverse'}`}
                                >
                                    {/* Profile Icon */}
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                        <img
                                            src={msg.role === 'bot' ? 'https://cdn.dribbble.com/userupload/16878194/file/original-3aaaac02f0527ee30cb5f47dd44394d1.png?resize=752x752' : 'https://cdn.dribbble.com/userupload/17795214/file/original-f533ad33757b0ed3488bdacbd0240d58.png?resize=400x400&vertical=center'}
                                            alt={`${msg.role === 'bot' ? 'Bot' : 'User'} Avatar`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Message Bubble */}
                                    <div
                                        className={`relative p-3 rounded-xl shadow-md text-sm mt-1 ${msg.role === 'bot'
                                            ? 'bg-gray-700 text-gray-200 self-start ml-3'
                                            : 'bg-blue-500 text-white self-end mr-3'
                                            }`}
                                        style={{ maxWidth: '70%', wordBreak: 'break-word' }}
                                    >
                                        <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>

                                        {/* Tail for the message bubble */}
                                        <div
                                            className={`absolute w-2.5 h-2.5 ${msg.role === 'bot' ? '-left-1 bg-gray-700' : '-right-1 bg-blue-500'}`}
                                            style={{
                                                clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
                                                top: '10px',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleAsk} className="flex flex-col sm:flex-row mt-4">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question..."
                        className="flex-1 bg-gray-800 text-gray-200 border border-gray-600 rounded-lg p-3 mb-4 sm:mb-0 sm:mr-4 shadow-inner focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#a290ff] to-[#098dfb] text-white px-4 py-3 rounded-lg hover:opacity-90 transition"
                    >
                        Ask
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FileUploadComponent;
