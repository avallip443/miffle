require 'sinatra'

# root route
get '/' do
  erb :index
end

get '/instructions' do
  erb :instructions
end

get '/play' do
  erb :play
end

get '/result' do
  erb :result
end
