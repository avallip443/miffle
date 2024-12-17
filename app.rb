require 'sinatra'

# root route
get '/' do
  erb :index
end

get '/instructions' do
  erb :instructions
end
